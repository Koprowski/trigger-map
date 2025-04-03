import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MapEditorWrapper from "@/components/MapEditorWrapper";
import { NodeType, MapNodeData } from "@/types";

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
    select: {
      id: true,
      goal: true,
      createdAt: true,
      nodes: {
        select: {
          id: true,
          content: true,
          type: true,
          order: true,
          createdAt: true,
          updatedAt: true,
          triggerMapId: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  if (!map) {
    return notFound();
  }

  // Format nodes to match the expected interface
  const formattedNodes: MapNodeData[] = map.nodes.map(node => ({
    id: node.id,
    content: node.content,
    type: node.type as NodeType,
    position: node.order,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    triggerMapId: node.triggerMapId
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