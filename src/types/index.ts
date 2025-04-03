export enum NodeType {
  TRIGGER = 'TRIGGER',
  ACTION = 'ACTION',
  OUTCOME = 'OUTCOME'
}

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