import { UserRole } from '../generated/prisma';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AuthService } from './auth.service';
import { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  UserResponseData, 
  toUserResponseData 
} from '../types/user.types';
import { 
  isValidEmail, 
  isValidUsername, 
  isStrongPassword, 
  isValidUserRole, 
  isValidPreferences 
} from '../utils/validation';
import { Logger } from '../utils/logger';

export class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username }
    });
  }

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    // Validate email
    if (!isValidEmail(userData.email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Validate username
    if (!isValidUsername(userData.username)) {
      throw new AppError('Username must be 3-30 characters and contain only letters, numbers, and underscores', 400);
    }

    // Validate password
    if (!isStrongPassword(userData.password)) {
      throw new AppError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers', 400);
    }

    // Check if email is already taken
    const emailExists = await this.getUserByEmail(userData.email);
    if (emailExists) {
      throw new AppError('Email already in use', 400);
    }

    // Check if username is already taken
    const usernameExists = await this.getUserByUsername(userData.username);
    if (usernameExists) {
      throw new AppError('Username already in use', 400);
    }

    // Validate role if provided
    if (userData.role && !isValidUserRole(userData.role)) {
      throw new AppError('Invalid user role', 400);
    }

    // Validate preferences if provided
    if (userData.preferences && !isValidPreferences(userData.preferences)) {
      throw new AppError('Invalid preferences format', 400);
    }

    // Hash password
    const passwordHash = await AuthService.hashPassword(userData.password);

    // Create user
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          passwordHash,
          role: userData.role || UserRole.READER,
          preferences: userData.preferences || {}
        }
      });

      Logger.info(`User created: ${user.id}`);
      return user;
    } catch (error) {
      Logger.error('Error creating user', error);
      throw new AppError('Failed to create user', 500);
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(id: string, data: UpdateUserData): Promise<User> {
    // Check if user exists
    const existingUser = await this.getUserById(id);

    // Validate email if provided
    if (data.email && !isValidEmail(data.email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Validate username if provided
    if (data.username && !isValidUsername(data.username)) {
      throw new AppError('Username must be 3-30 characters and contain only letters, numbers, and underscores', 400);
    }

    // Validate role if provided
    if (data.role && !isValidUserRole(data.role)) {
      throw new AppError('Invalid user role', 400);
    }

    // Validate preferences if provided
    if (data.preferences && !isValidPreferences(data.preferences)) {
      throw new AppError('Invalid preferences format', 400);
    }

    // Check if email is already taken
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.getUserByEmail(data.email);
      if (emailExists) {
        throw new AppError('Email already in use', 400);
      }
    }

    // Check if username is already taken
    if (data.username && data.username !== existingUser.username) {
      const usernameExists = await this.getUserByUsername(data.username);
      if (usernameExists) {
        throw new AppError('Username already in use', 400);
      }
    }

    // Update user
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(data.username && { username: data.username }),
          ...(data.email && { email: data.email }),
          ...(data.role && { role: data.role }),
          ...(data.preferences && { 
            preferences: {
              ...existingUser.preferences as Record<string, any>,
              ...data.preferences
            }
          })
        }
      });

      Logger.info(`User updated: ${id}`);
      return updatedUser;
    } catch (error) {
      Logger.error(`Error updating user ${id}`, error);
      throw new AppError('Failed to update user', 500);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<User> {
    // Check if user exists
    const user = await this.getUserById(id);

    // Validate new password
    if (!isStrongPassword(newPassword)) {
      throw new AppError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers', 400);
    }

    // Verify current password
    const isPasswordValid = await AuthService.comparePassword(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const passwordHash = await AuthService.hashPassword(newPassword);

    // Update user password
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { passwordHash }
      });

      Logger.info(`Password changed for user: ${id}`);
      return updatedUser;
    } catch (error) {
      Logger.error(`Error changing password for user ${id}`, error);
      throw new AppError('Failed to change password', 500);
    }
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(id: string, role: UserRole): Promise<User> {
    // Check if user exists
    await this.getUserById(id);

    // Validate role
    if (!isValidUserRole(role)) {
      throw new AppError('Invalid user role', 400);
    }

    // Update user role
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role }
      });

      Logger.info(`Role updated for user ${id} to ${role}`);
      return updatedUser;
    } catch (error) {
      Logger.error(`Error updating role for user ${id}`, error);
      throw new AppError('Failed to update user role', 500);
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<void> {
    // Check if user exists
    await this.getUserById(id);

    // Delete user
    try {
      await prisma.user.delete({
        where: { id }
      });
      
      Logger.info(`User deleted: ${id}`);
    } catch (error) {
      Logger.error(`Error deleting user ${id}`, error);
      throw new AppError('Failed to delete user', 500);
    }
  }

  /**
   * Get user response data (excluding sensitive information)
   */
  static getUserResponseData(user: User): UserResponseData {
    return toUserResponseData(user);
  }
}