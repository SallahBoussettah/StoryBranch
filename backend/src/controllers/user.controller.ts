import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AppError } from '../middleware/error.middleware';
import { UserRole } from '../generated/prisma';
import { isValidEmail, isValidUsername, isStrongPassword, isValidPreferences, isValidUserRole } from '../utils/validation';
import { UpdateUserData } from '../types/user.types';
import { Logger } from '../utils/logger';
import { prisma } from '../config/database';

export class UserController {
  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User is attached to request by auth middleware
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const user = await UserService.getUserById(req.user.id);
      const userData = UserService.getUserResponseData(user);

      // Return user data (excluding sensitive information)
      res.status(200).json({
        status: 'success',
        data: { user: userData }
      });
    } catch (error) {
      Logger.error('Error getting user profile', error);
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User is attached to request by auth middleware
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { username, email, preferences } = req.body;
      const updateData: UpdateUserData = {};

      // Validate email if provided
      if (email !== undefined) {
        if (!isValidEmail(email)) {
          throw new AppError('Invalid email format', 400);
        }
        updateData.email = email;
      }

      // Validate username if provided
      if (username !== undefined) {
        if (!isValidUsername(username)) {
          throw new AppError('Username must be 3-30 characters and contain only letters, numbers, and underscores', 400);
        }
        updateData.username = username;
      }

      // Validate preferences if provided
      if (preferences !== undefined) {
        if (!isValidPreferences(preferences)) {
          throw new AppError('Invalid preferences format', 400);
        }
        updateData.preferences = preferences;
      }

      // Update user
      const updatedUser = await UserService.updateUser(req.user.id, updateData);
      const userData = UserService.getUserResponseData(updatedUser);

      // Return updated user data
      res.status(200).json({
        status: 'success',
        data: { user: userData }
      });
    } catch (error) {
      Logger.error('Error updating user profile', error);
      next(error);
    }
  }

  /**
   * Get user profile with detailed information including achievements and statistics
   */
  static async getDetailedProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User is attached to request by auth middleware
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const user = await UserService.getUserById(req.user.id);
      const userData = UserService.getUserResponseData(user);

      // Get user achievements
      const achievements = await prisma.userAchievement.findMany({
        where: { userId: req.user.id },
        include: {
          achievement: true,
          story: {
            select: {
              id: true,
              title: true,
              coverImageUrl: true
            }
          }
        },
        orderBy: { earnedAt: 'desc' }
      });

      // Get user reading statistics
      const readingStats = await prisma.progress.findMany({
        where: { userId: req.user.id },
        include: {
          story: {
            select: {
              id: true,
              title: true,
              coverImageUrl: true
            }
          }
        }
      });

      // Calculate statistics
      const storiesStarted = readingStats.length;
      const storiesCompleted = readingStats.filter(progress => progress.completedAt !== null).length;
      const totalAchievements = achievements.length;

      // Return detailed profile data
      res.status(200).json({
        status: 'success',
        data: {
          user: userData,
          statistics: {
            storiesStarted,
            storiesCompleted,
            totalAchievements,
            completionRate: storiesStarted > 0 ? Math.round((storiesCompleted / storiesStarted) * 100) : 0
          },
          achievements: achievements.map(item => ({
            id: item.id,
            name: item.achievement.name,
            description: item.achievement.description,
            iconUrl: item.achievement.iconUrl,
            earnedAt: item.earnedAt,
            story: item.story
          })),
          readingProgress: readingStats.map(progress => ({
            storyId: progress.storyId,
            storyTitle: progress.story.title,
            coverImageUrl: progress.story.coverImageUrl,
            startedAt: progress.startedAt,
            lastActiveAt: progress.lastActiveAt,
            completedAt: progress.completedAt,
            isCompleted: progress.completedAt !== null,
            discoveredEndings: progress.discoveredEndings.length
          }))
        }
      });
    } catch (error) {
      Logger.error('Error getting detailed user profile', error);
      next(error);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User is attached to request by auth middleware
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password are required', 400);
      }

      // Validate password strength
      if (!isStrongPassword(newPassword)) {
        throw new AppError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers', 400);
      }

      // Change password
      await UserService.changePassword(req.user.id, currentPassword, newPassword);

      // Return success message
      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      Logger.error('Error changing password', error);
      next(error);
    }
  }

  /**
   * Get user by ID (admin only)
   */
  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('User ID is required', 400);
      }

      const user = await UserService.getUserById(id);
      const userData = UserService.getUserResponseData(user);

      res.status(200).json({
        status: 'success',
        data: { user: userData }
      });
    } catch (error) {
      Logger.error(`Error getting user by ID: ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate input
      if (!id || !role) {
        throw new AppError('User ID and role are required', 400);
      }

      // Validate role
      if (!isValidUserRole(role)) {
        throw new AppError('Invalid role', 400);
      }

      // Update user role
      const updatedUser = await UserService.updateUserRole(id, role as UserRole);
      const userData = UserService.getUserResponseData(updatedUser);

      // Return updated user data
      res.status(200).json({
        status: 'success',
        data: { user: userData }
      });
    } catch (error) {
      Logger.error(`Error updating user role: ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * Request role upgrade (reader to writer)
   */
  static async requestRoleUpgrade(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User is attached to request by auth middleware
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      // Check if user is already a writer or admin
      const user = await UserService.getUserById(req.user.id);
      if (user.role !== UserRole.READER) {
        throw new AppError('You already have elevated permissions', 400);
      }

      // In a real application, this would create a role upgrade request
      // For now, we'll simulate this by updating a field in the user's preferences
      const preferences = {
        ...(user.preferences as Record<string, any>),
        roleUpgradeRequested: true,
        roleUpgradeRequestedAt: new Date().toISOString()
      };

      // Update user preferences
      const updatedUser = await UserService.updateUser(req.user.id, { preferences });
      const userData = UserService.getUserResponseData(updatedUser);

      // Return success message
      res.status(200).json({
        status: 'success',
        message: 'Role upgrade request submitted successfully',
        data: { user: userData }
      });
    } catch (error) {
      Logger.error(`Error requesting role upgrade: ${req.user?.id}`, error);
      next(error);
    }
  }

  /**
   * Get role upgrade requests (admin only)
   */
  static async getRoleUpgradeRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Find users with role upgrade requests
      const users = await prisma.user.findMany({
        where: {
          role: UserRole.READER,
          preferences: {
            path: ['roleUpgradeRequested'],
            equals: true
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      const usersData = users.map(user => UserService.getUserResponseData(user));

      res.status(200).json({
        status: 'success',
        results: usersData.length,
        data: { users: usersData }
      });
    } catch (error) {
      Logger.error('Error getting role upgrade requests', error);
      next(error);
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User is attached to request by auth middleware
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      // Delete user
      await UserService.deleteUser(req.user.id);

      // Return success message
      res.status(204).send();
    } catch (error) {
      Logger.error(`Error deleting user: ${req.user?.id}`, error);
      next(error);
    }
  }

  /**
   * List users (admin only)
   */
  static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });

      const usersData = users.map(user => UserService.getUserResponseData(user));

      res.status(200).json({
        status: 'success',
        results: usersData.length,
        data: { users: usersData }
      });
    } catch (error) {
      Logger.error('Error listing users', error);
      next(error);
    }
  }
}