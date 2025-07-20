/**
 * User model interface
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User role enum
 */
export enum UserRole {
  READER = 'reader',
  WRITER = 'writer',
  ADMIN = 'admin'
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme: string;
  notifications: boolean;
  [key: string]: any;
}