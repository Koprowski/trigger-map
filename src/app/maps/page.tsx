import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MapCard from "@/components/MapCard";
import { NodeType } from "@prisma/client";

interface MapNode {
  id: string;
  triggerMapId: string;
  content: string;
  type: NodeType;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TriggerMap {
  id: string;
  userId: string;
  goal: string;
  createdAt: string;
  updatedAt: string;
  nodes: MapNode[];
  user: {
    name: string | null;
  };
}

export default async function MapsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const maps = await prisma.triggerMap.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      nodes: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Maps</h1>
          <Link
            href="/maps/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create New Map
          </Link>
        </div>

        <div className="grid gap-6">
          {maps.map((map) => (
            <Link
              key={map.id}
              href={`/maps/${map.id}/edit`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <h2 className="text-xl font-semibold mb-2">{map.goal}</h2>
              <div className="text-sm text-gray-500">
                {map.nodes.length} nodes • Created {new Date(map.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 