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