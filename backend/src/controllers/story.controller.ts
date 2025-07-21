import { Request, Response, NextFunction } from 'express';
import { StoryService } from '../services/story.service';
import { AppError } from '../middleware/error.middleware';
import { validateStoryData } from '../utils/validation';
import { Logger } from '../utils/logger';
import { UserRole, StoryStatus } from '../generated/prisma';

/**
 * Story controller class
 */
export class StoryController {
  /**
   * Get all stories
   * Public endpoint - returns only published stories
   */
  static async getAllStories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stories = await StoryService.getPublishedStories();

      res.status(200).json({
        status: 'success',
        results: stories.length,
        data: {
          stories: stories.map(story => StoryService.getStoryResponseData(story))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get stories by current user (writer's stories)
   * Protected endpoint - requires authentication
   */
  static async getMyStories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Validate UUID format
      const userId = req.user.id;
      if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        throw new AppError('Invalid user ID format', 400);
      }

      const stories = await StoryService.getStoriesByAuthor(userId);

      res.status(200).json({
        status: 'success',
        results: stories.length,
        data: {
          stories: stories.map(story => StoryService.getStoryResponseData(story))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get story by ID
   * Public endpoint for published stories
   * Protected for draft/archived stories (only author or admin)
   */
  static async getStoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate UUID format
      if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        throw new AppError('Invalid story ID format', 400);
      }
      
      const story = await StoryService.getStoryById(id);

      // Check if story is published or if user is authorized to view it
      if (
        story.status !== 'PUBLISHED' &&
        (!req.user || (req.user.id !== story.authorId && req.user.role !== UserRole.ADMIN))
      ) {
        throw new AppError('You do not have permission to access this story', 403);
      }

      res.status(200).json({
        status: 'success',
        data: {
          story: StoryService.getStoryResponseData(story)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new story
   * Protected endpoint - requires writer or admin role
   */
  static async createStory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Validate request body
      const validationError = validateStoryData(req.body);
      if (validationError) {
        throw new AppError(validationError, 400);
      }

      const storyData = {
        authorId: req.user.id,
        title: req.body.title,
        description: req.body.description,
        coverImageUrl: req.body.coverImageUrl,
        genres: req.body.genres || [],
        difficulty: req.body.difficulty,
        metadata: req.body.metadata
      };

      const story = await StoryService.createStory(storyData);

      res.status(201).json({
        status: 'success',
        data: {
          story: StoryService.getStoryResponseData(story)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a story
   * Protected endpoint - only author or admin can update
   */
  static async updateStory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;

      // Check if story exists and user is authorized
      const existingStory = await StoryService.getStoryById(id);

      // Only author or admin can update
      if (existingStory.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to update this story', 403);
      }

      // Validate request body
      if (Object.keys(req.body).length === 0) {
        throw new AppError('No update data provided', 400);
      }

      const updateData = {
        title: req.body.title,
        description: req.body.description,
        coverImageUrl: req.body.coverImageUrl,
        genres: req.body.genres,
        difficulty: req.body.difficulty,
        status: req.body.status,
        metadata: req.body.metadata
      };

      const updatedStory = await StoryService.updateStory(id, updateData);

      res.status(200).json({
        status: 'success',
        data: {
          story: StoryService.getStoryResponseData(updatedStory)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a story
   * Protected endpoint - only author or admin can delete
   */
  static async deleteStory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;

      // Check if story exists and user is authorized
      const existingStory = await StoryService.getStoryById(id);

      // Only author or admin can delete
      if (existingStory.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to delete this story', 403);
      }

      await StoryService.deleteStory(id);

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate story structure before publishing
   * Protected endpoint - only author or admin can validate
   */
  static async validateStoryForPublishing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;

      // Check if story exists and user is authorized
      const existingStory = await StoryService.getStoryById(id);

      // Only author or admin can validate
      if (existingStory.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to validate this story', 403);
      }

      const validationResult = await StoryService.validateStoryForPublishing(id);

      res.status(200).json({
        status: 'success',
        data: validationResult
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish a story
   * Protected endpoint - only author or admin can publish
   */
  static async publishStory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;

      // Check if story exists and user is authorized
      const existingStory = await StoryService.getStoryById(id);

      // Only author or admin can publish
      if (existingStory.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to publish this story', 403);
      }

      // Check if this is a new version of an existing story
      const metadata = existingStory.metadata as Record<string, any>;
      let publishedStory;

      if (existingStory.status === StoryStatus.DRAFT && metadata.isEditingNewVersion) {
        // Publishing a new version
        const notes = req.body.notes || undefined;
        publishedStory = await StoryService.publishNewVersion(id, notes);
      } else {
        // Publishing for the first time
        publishedStory = await StoryService.publishStory(id);
      }

      res.status(200).json({
        status: 'success',
        data: {
          story: StoryService.getStoryResponseData(publishedStory)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archive a story
   * Protected endpoint - only author or admin can archive
   */
  static async archiveStory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;

      // Check if story exists and user is authorized
      const existingStory = await StoryService.getStoryById(id);

      // Only author or admin can archive
      if (existingStory.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to archive this story', 403);
      }

      const archivedStory = await StoryService.archiveStory(id);

      res.status(200).json({
        status: 'success',
        data: {
          story: StoryService.getStoryResponseData(archivedStory)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}