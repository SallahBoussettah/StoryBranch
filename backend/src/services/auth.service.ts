import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '../generated/prisma';
import env from '../config/env.config';
import { AppError } from '../middleware/error.middleware';
import { Logger } from '../utils/logger';
import { prisma } from '../config/database';
import { User, CreateUserData, toUserResponseData } from '../types/user.types';
import { UserService } from './user.service';
import { isValidEmail, isStrongPassword, isValidUsername } from '../utils/validation';
import { StringValue } from 'ms';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: ReturnType<typeof toUserResponseData>;
  tokens: AuthTokens;
}

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a password with a hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT tokens (access and refresh)
   */
  static generateTokens(user: User): AuthTokens {
    // Create payload with minimal user data
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // Generate access token
    const accessToken = jwt.sign(
      payload,
      env.jwtSecret as jwt.Secret,
      { expiresIn: env.jwtExpiresIn as StringValue }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      payload,
      env.jwtSecret as jwt.Secret,
      { expiresIn: env.jwtRefreshExpiresIn as StringValue }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, env.jwtSecret as jwt.Secret) as TokenPayload;
      return decoded;
    } catch (error) {
      Logger.error('Token verification failed', error);
      throw new AppError('Invalid or expired token', 401);
    }
  }

  /**
   * Register a new user
   */
  static async register(userData: CreateUserData): Promise<AuthResponse> {
    // Validate input
    if (!userData.email || !userData.password || !userData.username) {
      throw new AppError('Email, password, and username are required', 400);
    }

    // Validate email format
    if (!isValidEmail(userData.email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Validate password strength
    if (!isStrongPassword(userData.password)) {
      throw new AppError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers', 400);
    }
    
    // Validate username format
    if (!isValidUsername(userData.username)) {
      throw new AppError('Username must be 3-30 characters and contain only letters, numbers, and underscores', 400);
    }

    try {
      // Create user using UserService
      const user = await UserService.createUser(userData);
      
      // Generate tokens
      const tokens = this.generateTokens(user);
      
      // Return user data and tokens
      return {
        user: toUserResponseData(user),
        tokens
      };
    } catch (error) {
      Logger.error('Registration failed', error);
      throw error;
    }
  }

  /**
   * Login a user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Log successful login
      Logger.info(`User logged in: ${user.id}`);

      // Return user data and tokens
      return {
        user: toUserResponseData(user),
        tokens
      };
    } catch (error) {
      Logger.error(`Login failed for email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Validate input
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    try {
      // Verify refresh token
      const decoded = this.verifyToken(refreshToken);

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      Logger.error('Token refresh failed', error);
      throw error;
    }
  }

  /**
   * Request password reset
   * This implementation creates a reset token and stores it in the database
   */
  static async requestPasswordReset(email: string): Promise<void> {
    // Validate input
    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Validate email format
    if (!isValidEmail(email)) {
      throw new AppError('Invalid email format', 400);
    }

    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // Don't reveal if user exists or not for security
      if (!user) {
        Logger.info(`Password reset requested for non-existent email: ${email}`);
        return;
      }

      // Generate a reset token (random string)
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Hash the token for security
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      
      // Set token expiration (10 minutes from now)
      const tokenExpires = new Date(Date.now() + 10 * 60 * 1000);
      
      // Store the token in the database
      await prisma.passwordReset.upsert({
        where: { userId: user.id },
        update: {
          token: hashedToken,
          expiresAt: tokenExpires
        },
        create: {
          userId: user.id,
          token: hashedToken,
          expiresAt: tokenExpires
        }
      });

      // In a production environment, send an email with the reset link
      // For now, just log the token
      Logger.info(`Password reset token generated for user: ${user.id}`);
      Logger.info(`Reset token: ${resetToken}`); // In production, this would be sent via email

      return;
    } catch (error) {
      Logger.error(`Password reset request failed for email: ${email}`, error);
      throw new AppError('Failed to process password reset request', 500);
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate input
    if (!token || !newPassword) {
      throw new AppError('Token and new password are required', 400);
    }

    // Validate password strength
    if (!isStrongPassword(newPassword)) {
      throw new AppError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers', 400);
    }

    try {
      // Hash the provided token to compare with stored hash
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      // Find the password reset record
      const passwordReset = await prisma.passwordReset.findFirst({
        where: {
          token: hashedToken,
          expiresAt: {
            gt: new Date() // Token must not be expired
          }
        },
        include: {
          user: true
        }
      });

      // Check if token exists and is valid
      if (!passwordReset) {
        throw new AppError('Invalid or expired password reset token', 400);
      }

      // Hash the new password
      const passwordHash = await this.hashPassword(newPassword);

      // Update user's password
      await prisma.user.update({
        where: { id: passwordReset.userId },
        data: { passwordHash }
      });

      // Delete the used token
      await prisma.passwordReset.delete({
        where: { id: passwordReset.id }
      });

      Logger.info(`Password reset successful for user: ${passwordReset.userId}`);
    } catch (error) {
      Logger.error(`Password reset failed with token: ${token}`, error);
      throw new AppError('Failed to reset password', 500);
    }
  }
}