'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { NodeType } from '@prisma/client';

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

export default function MapCard({ map }: { map: TriggerMap }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isOwner = session?.user?.id === map.userId;
  
  const username = map.user?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'user';
  const mapUrl = `/${username}/${map.id}`;

  const formattedDate = new Date(map.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleEdit = () => {
    router.push(`/maps/${map.id}/edit`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-center">{map.goal}</h3>
        </div>
      </div>

      <div className="flex flex-col space-y-0">
        {map.nodes.map((node, index) => (
          <div key={node.id} className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-lg w-full text-center">
              {node.content}
            </div>
            {index < map.nodes.length - 1 && (
              <div className="h-6 w-px bg-blue-300 my-1" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Link 
          href={mapUrl}
          className="text-sm text-blue-600 hover:text-blue-800 block mb-2"
        >
          {mapUrl}
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {formattedDate}
          </span>
          {isOwner && (
            <button
              onClick={handleEdit}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 