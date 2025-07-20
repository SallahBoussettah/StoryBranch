import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../config/database';
import { UserService } from '../services/user.service';
import { UserRole } from '../generated/prisma';
import { isValidEmail, isStrongPassword, isValidUsername, isValidUserRole, isValidPreferences } from '../utils/validation';

describe('User Model and Validation', () => {
  // Test validation functions
  describe('Validation Functions', () => {
    it('should validate email correctly', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@example')).toBe(false);
    });

    it('should validate password strength correctly', () => {
      expect(isStrongPassword('Password123')).toBe(true);
      expect(isStrongPassword('StrongP4ssword')).toBe(true);
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('weakpassword')).toBe(false);
      expect(isStrongPassword('WEAKPASSWORD')).toBe(false);
      expect(isStrongPassword('12345678')).toBe(false);
      expect(isStrongPassword('Weak1')).toBe(false);
    });

    it('should validate username correctly', () => {
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('user_name')).toBe(true);
      expect(isValidUsername('User_123')).toBe(true);
      expect(isValidUsername('us')).toBe(false);
      expect(isValidUsername('user-name')).toBe(false);
      expect(isValidUsername('user.name')).toBe(false);
      expect(isValidUsername('user@name')).toBe(false);
      expect(isValidUsername('a'.repeat(31))).toBe(false);
    });

    it('should validate user role correctly', () => {
      expect(isValidUserRole('READER')).toBe(true);
      expect(isValidUserRole('WRITER')).toBe(true);
      expect(isValidUserRole('ADMIN')).toBe(true);
      expect(isValidUserRole('INVALID')).toBe(false);
      expect(isValidUserRole('')).toBe(false);
    });

    it('should validate preferences correctly', () => {
      expect(isValidPreferences({ theme: 'dark', notifications: true })).toBe(true);
      expect(isValidPreferences({ theme: 'light', fontSize: 14 })).toBe(true);
      expect(isValidPreferences({ invalidKey: 'value' })).toBe(true); // Unknown keys are allowed
      expect(isValidPreferences('invalid')).toBe(false);
      expect(isValidPreferences(null)).toBe(false);
      expect(isValidPreferences([])).toBe(false);
      expect(isValidPreferences({ theme: 123 })).toBe(false); // Wrong type for theme
      expect(isValidPreferences({ notifications: 'yes' })).toBe(false); // Wrong type for notifications
    });
  });

  // Integration tests with database
  describe('User Service', () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'TestPassword123',
      role: UserRole.READER
    };

    let userId: string;

    // Clean up after tests
    afterAll(async () => {
      // Delete test user if it exists
      if (userId) {
        await prisma.user.delete({ where: { id: userId } });
      }
    });

    it('should create a user successfully', async () => {
      const user = await UserService.createUser(testUser);
      userId = user.id;

      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
      expect(user.username).toBe(testUser.username);
      expect(user.role).toBe(testUser.role);
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(testUser.password); // Password should be hashed
    });

    it('should get a user by ID', async () => {
      const user = await UserService.getUserById(userId);
      
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
      expect(user.email).toBe(testUser.email);
    });

    it('should update a user successfully', async () => {
      const updatedUser = await UserService.updateUser(userId, {
        username: `updated${testUser.username}`,
        preferences: { theme: 'dark', notifications: true }
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser.username).toBe(`updated${testUser.username}`);
      expect(updatedUser.email).toBe(testUser.email); // Email should not change
      expect(updatedUser.preferences).toEqual({ theme: 'dark', notifications: true });
    });

    it('should convert user to response data correctly', () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        username: 'testuser',
        role: UserRole.READER,
        preferences: { theme: 'dark' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const responseData = UserService.getUserResponseData(user);

      expect(responseData).toBeDefined();
      expect(responseData.id).toBe(user.id);
      expect(responseData.email).toBe(user.email);
      expect(responseData.username).toBe(user.username);
      expect(responseData.role).toBe(user.role);
      expect(responseData.preferences).toEqual(user.preferences);
      expect(responseData).not.toHaveProperty('passwordHash'); // Sensitive data should be excluded
    });
  });
});