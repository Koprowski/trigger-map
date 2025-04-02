// src/components/TriggerMapBuilder.tsx
'use client';

import { useState } from 'react';
import MapNodeItem from './MapNodeItem';
import { NodeType } from '@prisma/client';

interface MapNode {
  id: string;
  type: NodeType;
  content: string;
  position: { x: number; y: number };
}

interface TriggerMapBuilderProps {
  initialNodes?: MapNode[];
  onNodesChange?: (nodes: MapNode[]) => void;
}

export default function TriggerMapBuilder({ initialNodes = [], onNodesChange }: TriggerMapBuilderProps) {
  const [nodes, setNodes] = useState<MapNode[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const addNode = (type: NodeType) => {
    const newNode: MapNode = {
      id: Math.random().toString(),
      type,
      content: '',
      position: { x: 100, y: 100 },
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onNodesChange?.(updatedNodes);
  };

  const updateNode = (id: string, updates: Partial<MapNode>) => {
    const updatedNodes = nodes.map(node =>
      node.id === id ? { ...node, ...updates } : node
    );
    setNodes(updatedNodes);
    onNodesChange?.(updatedNodes);
  };

  const deleteNode = (id: string) => {
    const updatedNodes = nodes.filter(node => node.id !== id);
    setNodes(updatedNodes);
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
    onNodesChange?.(updatedNodes);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-100 rounded-lg">
      <div className="absolute top-4 left-4 space-x-2">
        <button
          onClick={() => addNode(NodeType.TRIGGER)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Add Trigger
        </button>
        <button
          onClick={() => addNode(NodeType.ACTION)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Action
        </button>
        <button
          onClick={() => addNode(NodeType.OUTCOME)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Outcome
        </button>
      </div>
      {nodes.map(node => (
        <MapNodeItem
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          onSelect={() => setSelectedNodeId(node.id)}
          onUpdate={(updates) => updateNode(node.id, updates)}
          onDelete={() => deleteNode(node.id)}
        />
      ))}
    </div>
  );
}