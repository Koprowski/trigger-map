import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MapEditorWrapper from "@/components/MapEditorWrapper";
import { NodeType, MapNodeData } from "@/types";

interface UserWithName {
  id: string;
  name: string | null;
  email?: string | null;
  image?: string | null;
}

export default async function MapPage({
  params,
}: {
  params: { username: string; mapId: string };
}) {
  // For SQLite, we need to use a different approach for case-insensitive searches
  // Convert the username for searching to lowercase
  const searchUsername = params.username.replace(/-/g, ' ').toLowerCase();
  
  // Find all users and filter manually for case-insensitive matching
  const users = await prisma.user.findMany({
    where: {
      name: {
        not: null, // Only consider users with names
      },
    },
  });
  
  // Find the user with a case-insensitive match
  const user = users.find((u: UserWithName) => 
    u.name?.toLowerCase().includes(searchUsername)
  );

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
  const formattedNodes: MapNodeData[] = map.nodes.map((node: any) => ({
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