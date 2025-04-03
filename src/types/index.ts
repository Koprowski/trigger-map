import { $Enums } from '@prisma/client';

export type NodeType = $Enums.NodeType;

export interface MapNode {
  id: string;
  content: string;
  type: NodeType;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  triggerMapId: string;
}

export interface MapNodeData {
  id: string;
  content: string;
  type: NodeType;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  triggerMapId: string;
}

export interface TriggerMapWithNodes {
  id: string;
  goal: string;
  createdAt: Date;
  nodes: MapNodeData[];
} 