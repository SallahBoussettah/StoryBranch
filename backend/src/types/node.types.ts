import { Node as PrismaNode } from '../generated/prisma';

/**
 * Node interface extending the Prisma Node model
 */
export interface Node extends PrismaNode {}

/**
 * Node creation data interface
 */
export interface CreateNodeData {
  storyId: string;
  title: string;
  content: string;
  isEnding?: boolean;
  metadata?: Record<string, any>;
  positionX?: number;
  positionY?: number;
}

/**
 * Node update data interface
 */
export interface UpdateNodeData {
  title?: string;
  content?: string;
  isEnding?: boolean;
  metadata?: Record<string, any>;
  positionX?: number;
  positionY?: number;
}

/**
 * Node response data interface
 */
export interface NodeResponseData {
  id: string;
  storyId: string;
  title: string;
  content: string;
  isEnding: boolean;
  metadata: Record<string, any>;
  positionX: number;
  positionY: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert Node model to response data
 */
export const toNodeResponseData = (node: Node): NodeResponseData => {
  return {
    id: node.id,
    storyId: node.storyId,
    title: node.title,
    content: node.content,
    isEnding: node.isEnding,
    metadata: node.metadata as Record<string, any>,
    positionX: node.positionX,
    positionY: node.positionY,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt
  };
};