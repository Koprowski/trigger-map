import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NodeType, MapNode, TriggerMap } from "@prisma/client";
import MapEditorWrapper from "@/components/MapEditorWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface MapNodeData {
  id: string;
  content: string;
  type: NodeType;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  triggerMapId: string;
}

interface EditMapPageProps {
  params: {
    mapId: string;
  };
}

interface MapWithNodes extends TriggerMap {
  nodes: (MapNode & { order: number })[];
  user: { name: string | null };
}

export default async function EditMapPage({ params }: EditMapPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    notFound();
  }

  const map = await prisma.triggerMap.findFirst({
    where: {
      id: params.mapId,
      userId: session.user.id,
    },
    include: {
      nodes: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  }) as MapWithNodes | null;

  if (!map) {
    notFound();
  }

  // Convert Float order values to numbers for sorting
  const sortedNodes = map.nodes.map((node) => ({
    id: node.id,
    content: node.content,
    type: node.type,
    position: Number(node.order || 0),
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    triggerMapId: node.triggerMapId,
  }));

  return (
    <div className="min-h-screen bg-white">
      <MapEditorWrapper
        goal={map.title}
        nodes={sortedNodes}
        createdAt={map.createdAt}
        userName={map.user.name || 'Unknown User'}
        mapId={map.id}
      />
    </div>
  );
} 