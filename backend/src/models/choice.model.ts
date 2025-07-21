/**
 * Choice model interface
 */
export interface Choice {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  text: string;
  order: number;
  conditions: ChoiceConditions;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Choice conditions interface
 */
export interface ChoiceConditions {
  requiresItem?: string;
  minimumStat?: { name: string, value: number };
  [key: string]: any;
}