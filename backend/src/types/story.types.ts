import { Story as PrismaStory, StoryStatus, Difficulty } from '../generated/prisma';

/**
 * Story interface extending the Prisma Story model
 */
export interface Story extends PrismaStory {}

/**
 * Story creation data interface
 */
export interface CreateStoryData {
  authorId: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  genres: string[];
  difficulty?: Difficulty;
  metadata?: Record<string, any>;
}

/**
 * Story update data interface
 */
export interface UpdateStoryData {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  genres?: string[];
  difficulty?: Difficulty;
  status?: StoryStatus;
  metadata?: Record<string, any>;
}

/**
 * Story response data interface
 */
export interface StoryResponseData {
  id: string;
  authorId: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  genres: string[];
  difficulty: Difficulty;
  status: StoryStatus;
  metadata: Record<string, any>;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert Story model to response data
 */
export const toStoryResponseData = (story: Story): StoryResponseData => {
  return {
    id: story.id,
    authorId: story.authorId,
    title: story.title,
    description: story.description,
    coverImageUrl: story.coverImageUrl || undefined,
    genres: story.genres,
    difficulty: story.difficulty,
    status: story.status,
    metadata: story.metadata as Record<string, any>,
    publishedAt: story.publishedAt || undefined,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt
  };
};