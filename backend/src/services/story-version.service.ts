import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { Logger } from '../utils/logger';
import { 
  StoryVersion, 
  CreateStoryVersionData, 
  StoryVersionResponseData, 
  toStoryVersionResponseData 
} from '../types/story-version.types';

export class StoryVersionService {
  /**
   * Get all versions for a story
   */
  static async getVersionsByStoryId(storyId: string): Promise<StoryVersion[]> {
    return prisma.storyVersion.findMany({
      where: { storyId },
      orderBy: { versionNumber: 'desc' }
    });
  }

  /**
   * Get specific version for a story
   */
  static async getStoryVersion(storyId: string, versionNumber: number): Promise<StoryVersion> {
    const version = await prisma.storyVersion.findFirst({
      where: { 
        storyId,
        versionNumber
      }
    });

    if (!version) {
      throw new AppError(`Version ${versionNumber} not found for story ${storyId}`, 404);
    }

    return version;
  }

  /**
   * Get latest version for a story
   */
  static async getLatestVersion(storyId: string): Promise<StoryVersion | null> {
    return prisma.storyVersion.findFirst({
      where: { storyId },
      orderBy: { versionNumber: 'desc' }
    });
  }

  /**
   * Create a new story version
   */
  static async createVersion(data: CreateStoryVersionData): Promise<StoryVersion> {
    try {
      const version = await prisma.storyVersion.create({
        data: {
          storyId: data.storyId,
          versionNumber: data.versionNumber,
          snapshot: data.snapshot,
          publishedAt: data.publishedAt,
          notes: data.notes
        }
      });

      Logger.info(`Story version created: ${version.id} (Story: ${data.storyId}, Version: ${data.versionNumber})`);
      return version;
    } catch (error) {
      Logger.error(`Error creating story version for story ${data.storyId}`, error);
      throw new AppError('Failed to create story version', 500);
    }
  }

  /**
   * Get story version response data
   */
  static getStoryVersionResponseData(version: StoryVersion): StoryVersionResponseData {
    return toStoryVersionResponseData(version);
  }
}