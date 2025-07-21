/**
 * Node model interface
 */
export interface Node {
  id: string;
  storyId: string;
  title: string;
  content: string;
  isEnding: boolean;
  metadata: NodeMetadata;
  positionX: number;
  positionY: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Node metadata interface
 */
export interface NodeMetadata {
  isStart?: boolean;
  endingType?: EndingType;
  [key: string]: any;
}

/**
 * Ending type enum
 */
export enum EndingType {
  GOOD = 'good',
  BAD = 'bad',
  NEUTRAL = 'neutral'
}