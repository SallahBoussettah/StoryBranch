import { StoryVersion as PrismaStoryVersion } from '../generated/prisma';

/**
 * StoryVersion interface extending the Prisma StoryVersion model
 */
export interface StoryVersion extends PrismaStoryVersion {}

/**
 * StoryVersion creation data interface
 */
export interface CreateStoryVersionData {
  storyId: string;
  versionNumber: number;
  snapshot: Record<string, any>;
  publishedAt: Date;
  notes?: string;
}

/**
 * StoryVersion response data interface
 */
export interface StoryVersionResponseData {
  id: string;
  storyId: string;
  versionNumber: number;
  snapshot: Record<string, any>;
  publishedAt: Date;
  notes?: string;
  createdAt: Date;
}

/**
 * Convert StoryVersion model to response data
 */
export const toStoryVersionResponseData = (version: StoryVersion): StoryVersionResponseData => {
  return {
    id: version.id,
    storyId: version.storyId,
    versionNumber: version.versionNumber,
    snapshot: version.snapshot as Record<string, any>,
    publishedAt: version.publishedAt,
    notes: version.notes || undefined,
    createdAt: version.createdAt
  };
};