'use client';

import { useState } from 'react';
import { NodeType } from '@prisma/client';

interface MapNode {
  id: string;
  type: NodeType;
  content: string;
  position: { x: number; y: number };
}

interface MapNodeItemProps {
  node: MapNode;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<MapNode>) => void;
  onDelete: () => void;
}

export default function MapNodeItem({
  node,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: MapNodeItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(node.content);

  const handleSave = () => {
    onUpdate({ content });
    setIsEditing(false);
  };

  const getNodeColor = () => {
    switch (node.type) {
      case NodeType.TRIGGER:
        return 'bg-red-100';
      case NodeType.ACTION:
        return 'bg-green-100';
      case NodeType.OUTCOME:
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getNodeLabel = () => {
    switch (node.type) {
      case NodeType.TRIGGER:
        return 'Trigger';
      case NodeType.ACTION:
        return 'Action';
      case NodeType.OUTCOME:
        return 'Outcome';
      default:
        return 'Node';
    }
  };

  return (
    <div
      className={`absolute p-4 rounded-lg shadow-lg cursor-move ${getNodeColor()} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onClick={onSelect}
      draggable
      onDragStart={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.dataTransfer.setData('text/plain', node.id);
        e.dataTransfer.setData('offset-x', (e.clientX - rect.left).toString());
        e.dataTransfer.setData('offset-y', (e.clientY - rect.top).toString());
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const offsetX = parseInt(e.dataTransfer.getData('offset-x'));
        const offsetY = parseInt(e.dataTransfer.getData('offset-y'));
        const rect = e.currentTarget.getBoundingClientRect();
        onUpdate({
          position: {
            x: e.clientX - rect.left - offsetX,
            y: e.clientY - rect.top - offsetY,
          },
        });
      }}
    >
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="font-semibold">{getNodeLabel()}</div>
          <div className="text-gray-700">{node.content || 'Click to edit'}</div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 