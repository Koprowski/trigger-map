import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NodeType } from "@prisma/client";
import MapEditorWrapper from "@/components/MapEditorWrapper";

interface MapNode {
  id: string;
  content: string;
  type: NodeType;
  order: number;
}

interface TriggerMapWithNodes {
  id: string;
  goal: string;
  createdAt: Date;
  nodes: MapNode[];
}

export default async function MapPage({
  params,
}: {
  params: { username: string; mapId: string };
}) {
  // Find the user by their normalized username
  const user = await prisma.user.findFirst({
    where: {
      name: {
        contains: params.username.replace(/-/g, ' '),
        mode: 'insensitive',
      },
    },
  });

  if (!user) {
    return notFound();
  }

  // Find the map with all necessary fields
  const map = await prisma.triggerMap.findFirst({
    where: {
      id: params.mapId,
      userId: user.id,
    },
    include: {
      nodes: true,
    },
  }) as unknown as TriggerMapWithNodes;

  if (!map) {
    return notFound();
  }

  // Format nodes to match the expected interface
  const formattedNodes = map.nodes
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(node => ({
      id: node.id,
      content: node.content,
      type: node.type,
      order: node.order || 0,
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      <MapEditorWrapper
        goal={map.goal}
        nodes={formattedNodes}
        createdAt={map.createdAt}
        userName={user.name || ''}
        mapId={params.mapId}
      />
    </div>
  );
} 