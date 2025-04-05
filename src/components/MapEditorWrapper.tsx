'use client';

import { useState } from "react";
import MapEditor from "./MapEditor";
import { NodeType, MapNodeData } from "@/types";
import Navigation from "./Navigation";

interface MapEditorWrapperProps {
  goal: string;
  nodes: MapNodeData[];
  createdAt: Date;
  userName: string;
  mapId: string;
}

export default function MapEditorWrapper({
  goal,
  nodes,
  createdAt,
  userName,
  mapId,
}: MapEditorWrapperProps) {
  const [localNodes, setLocalNodes] = useState(nodes);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleAddNode = async (index: number) => {
    try {
      const response = await fetch(`/api/maps/${mapId}/nodes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index }),
      });

      if (!response.ok) {
        throw new Error("Failed to add node");
      }

      const newNode = await response.json();
      const updatedNodes = [...localNodes];
      updatedNodes.splice(index, 0, newNode);
      setLocalNodes(updatedNodes);
      setHasChanges(true);
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  const handleUpdateNode = async (nodeId: string, content: string) => {
    try {
      const response = await fetch(`/api/maps/${mapId}/nodes/${nodeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to update node");
      }

      const updatedNode = await response.json();
      setLocalNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId ? { ...node, content: updatedNode.content } : node
        )
      );
      setHasChanges(true);
    } catch (error) {
      console.error("Error updating node:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save all nodes in their current order
      const response = await fetch(`/api/maps/${mapId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes: localNodes.map((node, index) => ({
            id: node.id,
            content: node.content,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save map");
      }

      setHasChanges(false);
    } catch (error) {
      console.error("Error saving map:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{goal}</h1>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`px-4 py-2 rounded ${
              hasChanges
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            } transition-colors`}
          >
            {isSaving ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
          </button>
        </div>
        <MapEditor
          goal={goal}
          nodes={localNodes}
          createdAt={createdAt}
          userName={userName}
          onAddNode={handleAddNode}
          onUpdateNode={handleUpdateNode}
        />
      </div>
    </div>
  );
} 