import { User as PrismaUser, UserRole } from '../generated/prisma';

/**
 * User interface extending the Prisma User model
 */
export interface User extends PrismaUser {}

/**
 * User creation data interface
 */
export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  role?: UserRole;
  preferences?: Record<string, any>;
}

/**
 * User update data interface
 */
export interface UpdateUserData {
  email?: string;
  username?: string;
  role?: UserRole;
  preferences?: Record<string, any>;
}

/**
 * User response data interface (excludes sensitive information)
 */
export interface UserResponseData {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert User model to response data (excluding sensitive information)
 */
export const toUserResponseData = (user: User): UserResponseData => {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    preferences: user.preferences as Record<string, any>,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};