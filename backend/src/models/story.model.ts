/**
 * Story model interface
 */
export interface Story {
  id: string;
  authorId: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  genres: string[];
  difficulty: Difficulty;
  status: StoryStatus;
  metadata: StoryMetadata;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Story status enum
 */
export enum StoryStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

/**
 * Difficulty enum
 */
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

/**
 * Story metadata interface
 */
export interface StoryMetadata {
  estimatedReadTime?: number;
  nodeCount?: number;
  endingCount?: number;
  version?: number;
  [key: string]: any;
}