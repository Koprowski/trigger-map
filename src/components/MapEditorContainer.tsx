'use client';

import { NodeType } from "@prisma/client";
import { useState } from "react";
import { addNode, updateNode } from "@/app/[username]/[mapId]/actions";

interface MapEditorContainerProps {
  goal: string;
  nodes: Array<{
    id: string;
    content: string;
    type: NodeType;
    order: number;
  }>;
  createdAt: Date;
  userName: string;
  mapId: string;
  username: string;
}

export default function MapEditorContainer({
  goal,
  nodes: initialNodes,
  createdAt,
  userName,
  mapId,
  username,
}: MapEditorContainerProps) {
  const [nodes, setNodes] = useState(initialNodes);

  const handleAddNode = async (index: number) => {
    try {
      const nodeOrders = nodes.map(node => node.order);
      await addNode(mapId, index, nodeOrders, username);
    } catch (error) {
      console.error('Failed to add node:', error);
    }
  };

  const handleUpdateNode = async (nodeId: string, content: string) => {
    try {
      await updateNode(nodeId, content, mapId, username);
      setNodes(nodes.map(node => 
        node.id === nodeId ? { ...node, content } : node
      ));
    } catch (error) {
      console.error('Failed to update node:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{goal}</h1>
      <div className="space-y-4">
        {nodes.map((node, index) => (
          <div key={node.id} className="flex items-center space-x-4">
            <button
              onClick={() => handleAddNode(index)}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              +
            </button>
            <div className="flex-1">
              <textarea
                value={node.content}
                onChange={(e) => handleUpdateNode(node.id, e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddNode(nodes.length)}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Node
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Created by {userName} on {createdAt.toLocaleDateString()}
      </div>
    </div>
  );
} 