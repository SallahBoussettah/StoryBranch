import { Request, Response, NextFunction } from 'express';
import { StoryVersionService } from '../services/story-version.service';
import { StoryService } from '../services/story.service';
import { AppError } from '../middleware/error.middleware';
import { UserRole } from '../generated/prisma';

/**
 * StoryVersion controller class
 */
export class StoryVersionController {
  /**
   * Get all versions for a story
   * Protected endpoint - only author or admin can access
   */
  static async getStoryVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { storyId } = req.params;
      
      // Check if story exists and user is authorized
      const story = await StoryService.getStoryById(storyId);
      
      // Only author or admin can access versions
      if (story.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to access versions for this story', 403);
      }
      
      const versions = await StoryVersionService.getVersionsByStoryId(storyId);
      
      res.status(200).json({
        status: 'success',
        results: versions.length,
        data: {
          versions: versions.map(version => StoryVersionService.getStoryVersionResponseData(version))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific version for a story
   * Protected endpoint - only author or admin can access
   */
  static async getStoryVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { storyId, versionNumber } = req.params;
      
      // Check if story exists and user is authorized
      const story = await StoryService.getStoryById(storyId);
      
      // Only author or admin can access versions
      if (story.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to access versions for this story', 403);
      }
      
      const version = await StoryVersionService.getStoryVersion(storyId, parseInt(versionNumber, 10));
      
      res.status(200).json({
        status: 'success',
        data: {
          version: StoryVersionService.getStoryVersionResponseData(version)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}