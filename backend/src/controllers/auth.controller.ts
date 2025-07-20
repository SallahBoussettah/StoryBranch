import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';
import { UserRole } from '../generated/prisma';
import { Logger } from '../utils/logger';
import { CreateUserData, toUserResponseData } from '../types/user.types';
import { prisma } from '../config/database';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, username, role } = req.body;

      // Create user data object
      const userData: CreateUserData = {
        email,
        password,
        username,
        role: role && Object.values(UserRole).includes(role as UserRole) ? role as UserRole : UserRole.READER
      };

      // Register user
      const { user, tokens } = await AuthService.register(userData);

      // Return user data and tokens
      res.status(201).json({
        status: 'success',
        data: { user, tokens }
      });
    } catch (error) {
      Logger.error('Registration failed', error);
      next(error);
    }
  }

  /**
   * Login a user
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Login user
      const { user, tokens } = await AuthService.login(email, password);

      // Return user data and tokens
      res.status(200).json({
        status: 'success',
        data: { user, tokens }
      });
    } catch (error) {
      Logger.error('Login failed', error);
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      // Refresh token
      const tokens = await AuthService.refreshToken(refreshToken);

      // Return new tokens
      res.status(200).json({
        status: 'success',
        data: { tokens }
      });
    } catch (error) {
      Logger.error('Token refresh failed', error);
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User is attached to request by auth middleware
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      // Get full user data from database
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Return user data (excluding sensitive information)
      res.status(200).json({
        status: 'success',
        data: { user: toUserResponseData(user) }
      });
    } catch (error) {
      Logger.error('Error getting user profile', error);
      next(error);
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      // Request password reset
      await AuthService.requestPasswordReset(email);
      
      // Return success message (don't reveal if user exists)
      res.status(200).json({
        status: 'success',
        message: 'If an account with that email exists, a password reset link will be sent.'
      });
    } catch (error) {
      Logger.error('Password reset request failed', error);
      next(error);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      // Reset password
      await AuthService.resetPassword(token, password);
      
      // Return success message
      res.status(200).json({
        status: 'success',
        message: 'Password has been reset successfully.'
      });
    } catch (error) {
      Logger.error('Password reset failed', error);
      next(error);
    }
  }
}