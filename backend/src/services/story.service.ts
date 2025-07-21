import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { Logger } from '../utils/logger';
import { 
  Story, 
  CreateStoryData, 
  UpdateStoryData, 
  StoryResponseData, 
  toStoryResponseData 
} from '../types/story.types';
import { StoryStatus } from '../generated/prisma';
import { StoryVersionService } from './story-version.service';
import { ChoiceService } from './choice.service';

export class StoryService {
  /**
   * Get all stories
   */
  static async getAllStories(): Promise<Story[]> {
    return prisma.story.findMany();
  }

  /**
   * Get published stories
   */
  static async getPublishedStories(): Promise<Story[]> {
    return prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED }
    });
  }

  /**
   * Get stories by author ID
   */
  static async getStoriesByAuthor(authorId: string): Promise<Story[]> {
    return prisma.story.findMany({
      where: { authorId }
    });
  }

  /**
   * Get story by ID
   */
  static async getStoryById(id: string): Promise<Story> {
    // Validate UUID format before querying
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new AppError('Invalid story ID format', 400);
    }
    
    try {
      const story = await prisma.story.findUnique({
        where: { id }
      });

      if (!story) {
        throw new AppError('Story not found', 404);
      }

      return story;
    } catch (error) {
      // Handle Prisma errors related to UUID validation
      if (error instanceof Error && 
          (error.message.includes('UUID') || 
           error.message.includes('Inconsistent column data'))) {
        throw new AppError('Invalid story ID format', 400);
      }
      throw error;
    }
  }

  /**
   * Create a new story
   */
  static async createStory(data: CreateStoryData): Promise<Story> {
    try {
      const story = await prisma.story.create({
        data: {
          authorId: data.authorId,
          title: data.title,
          description: data.description,
          coverImageUrl: data.coverImageUrl,
          genres: data.genres,
          difficulty: data.difficulty || 'MEDIUM',
          metadata: data.metadata || {},
          status: StoryStatus.DRAFT
        }
      });

      Logger.info(`Story created: ${story.id}`);
      return story;
    } catch (error) {
      Logger.error('Error creating story', error);
      throw new AppError('Failed to create story', 500);
    }
  }

  /**
   * Update a story
   * For published stories, this creates a draft copy for editing
   */
  static async updateStory(id: string, data: UpdateStoryData): Promise<Story> {
    // Check if story exists
    const story = await this.getStoryById(id);

    try {
      // If the story is published and we're updating content (not just metadata),
      // we need to handle versioning
      if (story.status === StoryStatus.PUBLISHED && 
          (data.title || data.description || data.coverImageUrl !== undefined || 
           data.genres || data.difficulty)) {
        
        // Get current version from metadata
        const metadata = story.metadata as Record<string, any>;
        const currentVersion = metadata.currentVersion || 1;
        
        // Update metadata to indicate this is a draft of the next version
        const updatedMetadata = {
          ...metadata,
          isEditingNewVersion: true,
          draftVersion: currentVersion + 1
        };
        
        // Update the story with the new data and draft status
        const updatedStory = await prisma.story.update({
          where: { id },
          data: {
            ...(data.title && { title: data.title }),
            ...(data.description && { description: data.description }),
            ...(data.coverImageUrl !== undefined && { coverImageUrl: data.coverImageUrl }),
            ...(data.genres && { genres: data.genres }),
            ...(data.difficulty && { difficulty: data.difficulty }),
            status: StoryStatus.DRAFT, // Change to draft while editing
            metadata: updatedMetadata
          }
        });
        
        Logger.info(`Published story moved to draft for editing: ${id} (Draft version: ${currentVersion + 1})`);
        return updatedStory;
      } else {
        // Regular update for non-published stories or metadata-only updates
        const updatedStory = await prisma.story.update({
          where: { id },
          data: {
            ...(data.title && { title: data.title }),
            ...(data.description && { description: data.description }),
            ...(data.coverImageUrl !== undefined && { coverImageUrl: data.coverImageUrl }),
            ...(data.genres && { genres: data.genres }),
            ...(data.difficulty && { difficulty: data.difficulty }),
            ...(data.status && { status: data.status }),
            ...(data.metadata && { 
              metadata: data.metadata 
            })
          }
        });

        Logger.info(`Story updated: ${id}`);
        return updatedStory;
      }
    } catch (error) {
      Logger.error(`Error updating story ${id}`, error);
      throw new AppError('Failed to update story', 500);
    }
  }

  /**
   * Delete a story
   */
  static async deleteStory(id: string): Promise<void> {
    // Check if story exists
    await this.getStoryById(id);

    try {
      await prisma.story.delete({
        where: { id }
      });
      
      Logger.info(`Story deleted: ${id}`);
    } catch (error) {
      Logger.error(`Error deleting story ${id}`, error);
      throw new AppError('Failed to delete story', 500);
    }
  }

  /**
   * Validate story before publishing
   * Checks for structural integrity and completeness
   */
  static async validateStoryForPublishing(id: string): Promise<{
    isValid: boolean;
    validationResult: any;
    message?: string;
  }> {
    // Check if story exists
    const story = await this.getStoryById(id);
    
    // Validate story structure
    const validationResult = await ChoiceService.validateStoryStructure(id);
    
    if (!validationResult.isValid) {
      let message = 'Story structure validation failed:';
      
      if (!validationResult.startNode) {
        message += ' Missing start node.';
      }
      
      if (!validationResult.endingNodes) {
        message += ' Missing ending nodes.';
      }
      
      if (validationResult.orphanedNodes.length > 0) {
        message += ` Found ${validationResult.orphanedNodes.length} orphaned nodes.`;
      }
      
      if (validationResult.unreachableNodes.length > 0) {
        message += ` Found ${validationResult.unreachableNodes.length} unreachable nodes.`;
      }
      
      if (validationResult.deadEnds.length > 0) {
        message += ` Found ${validationResult.deadEnds.length} dead ends.`;
      }
      
      return {
        isValid: false,
        validationResult,
        message
      };
    }
    
    return {
      isValid: true,
      validationResult
    };
  }

  /**
   * Create a snapshot of the story and its nodes/choices
   * Used for versioning
   */
  static async createStorySnapshot(id: string): Promise<Record<string, any>> {
    // Get story with all related data
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        nodes: {
          include: {
            sourceChoices: true
          }
        }
      }
    });
    
    if (!story) {
      throw new AppError('Story not found', 404);
    }
    
    // Create a deep copy of the story data
    const snapshot = JSON.parse(JSON.stringify(story));
    
    return snapshot;
  }

  /**
   * Publish a story
   * Validates story structure and creates a version
   */
  static async publishStory(id: string): Promise<Story> {
    // Check if story exists
    const story = await this.getStoryById(id);

    // Check if story is already published
    if (story.status === StoryStatus.PUBLISHED) {
      throw new AppError('Story is already published', 400);
    }
    
    // Validate story structure before publishing
    const validation = await this.validateStoryForPublishing(id);
    if (!validation.isValid) {
      throw new AppError(validation.message || 'Story structure validation failed', 400);
    }

    try {
      // Create a snapshot of the story for versioning
      const snapshot = await this.createStorySnapshot(id);
      
      // Get the next version number
      const latestVersion = await StoryVersionService.getLatestVersion(id);
      const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
      
      // Start a transaction to ensure both story update and version creation succeed or fail together
      return await prisma.$transaction(async (tx) => {
        // Update the story status to published
        const publishedStory = await tx.story.update({
          where: { id },
          data: {
            status: StoryStatus.PUBLISHED,
            publishedAt: new Date(),
            metadata: {
              ...(story.metadata as object),
              currentVersion: versionNumber
            }
          }
        });
        
        // Create a new version record
        await tx.storyVersion.create({
          data: {
            storyId: id,
            versionNumber,
            snapshot,
            publishedAt: publishedStory.publishedAt!,
            notes: `Initial publication of "${story.title}"`
          }
        });
        
        Logger.info(`Story published: ${id} (Version: ${versionNumber})`);
        return publishedStory;
      });
    } catch (error) {
      Logger.error(`Error publishing story ${id}`, error);
      throw new AppError('Failed to publish story', 500);
    }
  }

  /**
   * Publish a new version of an already published story
   */
  static async publishNewVersion(id: string, notes?: string): Promise<Story> {
    // Check if story exists
    const story = await this.getStoryById(id);
    
    // Get metadata
    const metadata = story.metadata as Record<string, any>;
    
    // Check if this is a draft of a new version
    if (story.status !== StoryStatus.DRAFT || !metadata.isEditingNewVersion) {
      throw new AppError('Story must be a draft of a new version to publish as a new version', 400);
    }
    
    // Validate story structure before publishing
    const validation = await this.validateStoryForPublishing(id);
    if (!validation.isValid) {
      throw new AppError(validation.message || 'Story structure validation failed', 400);
    }

    try {
      // Create a snapshot of the story for versioning
      const snapshot = await this.createStorySnapshot(id);
      
      // Get the next version number from metadata
      const versionNumber = metadata.draftVersion || (metadata.currentVersion + 1);
      
      // Start a transaction to ensure both story update and version creation succeed or fail together
      return await prisma.$transaction(async (tx) => {
        // Update the story status to published and update metadata
        const updatedMetadata = {
          ...metadata,
          currentVersion: versionNumber,
          isEditingNewVersion: false,
          draftVersion: undefined
        };
        
        // Update the story
        const publishedStory = await tx.story.update({
          where: { id },
          data: {
            status: StoryStatus.PUBLISHED,
            publishedAt: new Date(),
            metadata: updatedMetadata
          }
        });
        
        // Create a new version record
        await tx.storyVersion.create({
          data: {
            storyId: id,
            versionNumber,
            snapshot,
            publishedAt: publishedStory.publishedAt!,
            notes: notes || `Version ${versionNumber} of "${story.title}"`
          }
        });
        
        Logger.info(`New story version published: ${id} (Version: ${versionNumber})`);
        return publishedStory;
      });
    } catch (error) {
      Logger.error(`Error publishing new version of story ${id}`, error);
      throw new AppError('Failed to publish new story version', 500);
    }
  }
  
  /**
   * Get a specific version of a story
   */
  static async getStoryVersion(id: string, versionNumber: number): Promise<Record<string, any>> {
    // Check if story exists
    await this.getStoryById(id);
    
    // Get the requested version
    const version = await StoryVersionService.getStoryVersion(id, versionNumber);
    
    return version.snapshot as Record<string, any>;
  }

  /**
   * Archive a story
   */
  static async archiveStory(id: string): Promise<Story> {
    // Check if story exists
    await this.getStoryById(id);

    try {
      const archivedStory = await prisma.story.update({
        where: { id },
        data: {
          status: StoryStatus.ARCHIVED
        }
      });

      Logger.info(`Story archived: ${id}`);
      return archivedStory;
    } catch (error) {
      Logger.error(`Error archiving story ${id}`, error);
      throw new AppError('Failed to archive story', 500);
    }
  }

  /**
   * Get story response data
   */
  static getStoryResponseData(story: Story): StoryResponseData {
    return toStoryResponseData(story);
  }
}