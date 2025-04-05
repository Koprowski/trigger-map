'use client';

import { useState, useCallback } from 'react';
import { Switch } from '@headlessui/react';
import { PencilIcon, LockClosedIcon, LockOpenIcon, LinkIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { prisma } from '@/lib/prisma';

type NodeType = 'TRIGGER' | 'ACTION' | 'OUTCOME';

interface MapNodeData {
  id: string;
  content: string;
  type: NodeType;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  triggerMapId: string;
}

interface MapEditorProps {
  goal: string;
  nodes: MapNodeData[];
  createdAt: Date;
  userName: string;
  onAddNode: (index: number) => void;
  onUpdateNode: (nodeId: string, content: string) => void;
}

export default function MapEditor({ 
  goal, 
  nodes, 
  createdAt, 
  userName,
  onAddNode,
  onUpdateNode,
}: MapEditorProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editedGoal, setEditedGoal] = useState(goal);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const handleAddNode = useCallback((index: number) => {
    onAddNode(index);
  }, [onAddNode]);

  const handleEditNode = useCallback((nodeId: string, content: string) => {
    onUpdateNode(nodeId, content);
    setEditingNodeId(null);
  }, [onUpdateNode]);

  const handleGoalEdit = useCallback(() => {
    setIsEditingGoal(true);
  }, []);

  const handleGoalBlur = useCallback(() => {
    setIsEditingGoal(false);
  }, []);

  const handleGoalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedGoal(e.target.value);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (!isLocked) {
      setEditingNodeId(nodeId);
    }
  }, [isLocked]);

  const handleNodeBlur = useCallback((nodeId: string, content: string) => {
    handleEditNode(nodeId, content);
  }, [handleEditNode]);

  const handleNodeKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, nodeId: string) => {
    if (e.key === 'Enter') {
      handleEditNode(nodeId, e.currentTarget.value);
    }
  }, [handleEditNode]);

  // Sort nodes by order, handling Float values
  const sortedNodes = [...nodes].sort((a, b) => Number(a.position) - Number(b.position));

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4">
      <div className="w-full flex justify-center items-center mb-8">
        <div className="flex items-center gap-2">
          <Switch
            checked={!isLocked}
            onChange={() => setIsLocked(!isLocked)}
            className={`${
              !isLocked ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span className="sr-only">Enable editing</span>
            <span
              className={`${
                !isLocked ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="flex items-center gap-1">
            {isLocked ? (
              <>
                <LockClosedIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Locked</span>
              </>
            ) : (
              <>
                <LockOpenIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-500">Unlocked</span>
              </>
            )}
          </span>
        </div>
        {!isLocked && (
          <button
            onClick={() => setIsEditingSlug(true)}
            className="absolute right-4 flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <LinkIcon className="h-4 w-4" />
            <span className="text-sm">Edit URL</span>
          </button>
        )}
      </div>

      <div className="w-full space-y-8">
        {isEditingGoal && !isLocked ? (
          <input
            type="text"
            value={editedGoal}
            onChange={handleGoalChange}
            onBlur={handleGoalBlur}
            className="text-3xl font-bold w-full text-center border-b border-gray-300 focus:border-blue-500 focus:outline-none pb-2"
            autoFocus
          />
        ) : (
          <div className="flex justify-center items-center gap-2">
            <h1 className="text-3xl font-bold text-center">{editedGoal}</h1>
            {!isLocked && (
              <button
                onClick={handleGoalEdit}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div className="space-y-4">
          {!isLocked && sortedNodes.length === 0 && (
            <div className="h-8 flex items-center justify-center">
              <button
                onClick={() => handleAddNode(0)}
                className="text-blue-500 hover:text-blue-600"
              >
                <PlusCircleIcon className="h-6 w-6" />
              </button>
            </div>
          )}
          {sortedNodes.map((node, index) => (
            <div key={node.id} className="relative">
              {!isLocked && index === 0 && (
                <div className="h-8 flex items-center justify-center">
                  <button
                    onClick={() => handleAddNode(0)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <PlusCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              )}
              {editingNodeId === node.id ? (
                <input
                  type="text"
                  defaultValue={node.content}
                  onBlur={(e) => handleNodeBlur(node.id, e.target.value)}
                  onKeyDown={(e) => handleNodeKeyDown(e, node.id)}
                  className="w-full p-3 bg-blue-50 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <div 
                  onClick={() => handleNodeClick(node.id)}
                  className={`bg-blue-50 p-3 rounded-lg text-center ${!isLocked ? 'cursor-pointer hover:bg-blue-100' : ''}`}
                >
                  {node.content}
                </div>
              )}
              {!isLocked && (
                <div className="h-8 flex items-center justify-center">
                  <button
                    onClick={() => handleAddNode(index + 1)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <PlusCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-sm text-gray-500 text-center">
          Created by {userName} on{" "}
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>

      {isEditingSlug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit URL</h2>
            <p className="text-sm text-gray-600 mb-4">
              Changing the URL will update the link to this map. Make sure to share the new URL with anyone who needs access.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditingSlug(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement slug update
                  setIsEditingSlug(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 