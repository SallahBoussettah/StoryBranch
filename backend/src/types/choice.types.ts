import { Choice as PrismaChoice } from '../generated/prisma';

/**
 * Choice interface extending the Prisma Choice model
 */
export interface Choice extends PrismaChoice {}

/**
 * Choice creation data interface
 */
export interface CreateChoiceData {
  sourceNodeId: string;
  targetNodeId: string;
  text: string;
  order?: number;
  conditions?: Record<string, any>;
}

/**
 * Choice update data interface
 */
export interface UpdateChoiceData {
  targetNodeId?: string;
  text?: string;
  order?: number;
  conditions?: Record<string, any>;
}

/**
 * Choice response data interface
 */
export interface ChoiceResponseData {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  text: string;
  order: number;
  conditions: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert Choice model to response data
 */
export const toChoiceResponseData = (choice: Choice): ChoiceResponseData => {
  return {
    id: choice.id,
    sourceNodeId: choice.sourceNodeId,
    targetNodeId: choice.targetNodeId,
    text: choice.text,
    order: choice.order,
    conditions: choice.conditions as Record<string, any>,
    createdAt: choice.createdAt,
    updatedAt: choice.updatedAt
  };
};