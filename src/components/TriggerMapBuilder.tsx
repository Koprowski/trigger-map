// src/components/MapNodeItem.tsx
import React from 'react';
import { MapNode, NodeType } from '@prisma/client';

interface UIMapNode extends Omit<MapNode, 'id' | 'triggerMapId' | 'createdAt' | 'updatedAt'> {
    tempId: string;
}


interface MapNodeItemProps {
  node: UIMapNode;
  onAddNode: () => void; // Function to call when (+) is clicked
  // Add other handlers like onEdit, onDelete later
}

export default function MapNodeItem({ node, onAddNode }: MapNodeItemProps) {
  const nodeBgColor = node.type === 'BEHAVIOR' ? 'bg-blue-100 border-blue-300' : 'bg-green-100 border-green-300';
  const nodeTextColor = node.type === 'BEHAVIOR' ? 'text-blue-800' : 'text-green-800';

  return (
    <div className="flex flex-col items-center w-full">
      {/* '+' Button Above Node (for inserting before this node - handled by previous node's 'add below') */}
      {/* We only need the '+' button below each node to insert *after* it */}

      {/* The Node itself */}
      <div className={`p-2 px-4 rounded border ${nodeBgColor} ${nodeTextColor} text-center my-1 w-full max-w-md shadow-sm`}>
        {node.content}
        <span className="text-xs ml-2 opacity-50">({node.type})</span>
        {/* Add Edit/Delete buttons here later if needed */}
      </div>

      {/* '+' Button Below Node */}
      <button
         onClick={onAddNode}
         className="my-1 w-6 h-6 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 flex items-center justify-center text-lg font-bold"
         title="Add step after this"
       >
         +
       </button>
    </div>
  );
}