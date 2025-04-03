import { $Enums, Prisma } from '@prisma/client';

export type NodeType = $Enums.NodeType;

export type MapNode = Prisma.MapNodeGetPayload<{
  select: {
    id: true;
    content: true;
    type: true;
    order: true;
    createdAt: true;
    updatedAt: true;
    triggerMapId: true;
  }
}>;

export interface MapNodeData {
  id: string;
  content: string;
  type: NodeType;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  triggerMapId: string;
}

export type TriggerMapWithNodes = Prisma.TriggerMapGetPayload<{
  select: {
    id: true;
    goal: true;
    createdAt: true;
    nodes: {
      select: {
        id: true;
        content: true;
        type: true;
        order: true;
        createdAt: true;
        updatedAt: true;
        triggerMapId: true;
      };
    };
  };
}>; 