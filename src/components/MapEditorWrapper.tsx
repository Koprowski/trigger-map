'use client';

import { useState } from "react";
import MapEditor from "./MapEditor";
import { NodeType } from "@prisma/client";

interface MapNodeData {
  id: string;
  content: string;
  type: NodeType;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  triggerMapId: string;
}

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
    } catch (error) {
      console.error("Error updating node:", error);
    }
  };

  return (
    <MapEditor
      goal={goal}
      nodes={localNodes}
      createdAt={createdAt}
      userName={userName}
      onAddNode={handleAddNode}
      onUpdateNode={handleUpdateNode}
    />
  );
} 