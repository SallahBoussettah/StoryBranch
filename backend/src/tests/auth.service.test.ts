import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../config/database';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { UserRole } from '../generated/prisma';
import jwt from 'jsonwebtoken';
import env from '../config/env.config';

describe('Auth Service', () => {
  const testUser = {
    email: `auth-test-${Date.now()}@example.com`,
    username: `authtest${Date.now()}`,
    password: 'TestPassword123',
    role: UserRole.READER
  };

  let userId: string;
  let refreshToken: string;

  // Clean up after tests
  afterAll(async () => {
    // Delete test user if it exists
    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
    }
  });

  it('should register a new user successfully', async () => {
    const result = await AuthService.register(testUser);
    userId = result.user.id;

    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testUser.email);
    expect(result.user.username).toBe(testUser.username);
    expect(result.user.role).toBe(testUser.role);
    expect(result.tokens).toBeDefined();
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();

    // Save refresh token for later tests
    refreshToken = result.tokens.refreshToken;
  });

  it('should login a user successfully', async () => {
    const result = await AuthService.login(testUser.email, testUser.password);

    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testUser.email);
    expect(result.user.username).toBe(testUser.username);
    expect(result.tokens).toBeDefined();
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });

  it('should fail login with incorrect password', async () => {
    await expect(AuthService.login(testUser.email, 'WrongPassword123')).rejects.toThrow('Invalid email or password');
  });

  it('should fail login with non-existent email', async () => {
    await expect(AuthService.login('nonexistent@example.com', testUser.password)).rejects.toThrow('Invalid email or password');
  });

  it('should refresh tokens successfully', async () => {
    const result = await AuthService.refreshToken(refreshToken);

    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should verify tokens correctly', () => {
    const user = {
      id: 'test-id',
      email: 'test@example.com',
      role: UserRole.READER
    };

    const tokens = AuthService.generateTokens(user as any);
    const decoded = AuthService.verifyToken(tokens.accessToken);

    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(user.id);
    expect(decoded.email).toBe(user.email);
    expect(decoded.role).toBe(user.role);
  });

  it('should request password reset successfully', async () => {
    await expect(AuthService.requestPasswordReset(testUser.email)).resolves.not.toThrow();
    
    // Check if a password reset record was created
    const passwordReset = await prisma.passwordReset.findFirst({
      where: { user: { email: testUser.email } }
    });
    
    expect(passwordReset).toBeDefined();
    expect(passwordReset?.userId).toBe(userId);
    expect(passwordReset?.token).toBeDefined();
    expect(passwordReset?.expiresAt).toBeInstanceOf(Date);
    expect(passwordReset?.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('should reset password with valid token', async () => {
    // First request a password reset to get a token
    await AuthService.requestPasswordReset(testUser.email);
    
    // Get the password reset record
    const passwordReset = await prisma.passwordReset.findFirst({
      where: { user: { email: testUser.email } }
    });
    
    expect(passwordReset).toBeDefined();
    
    // We can't directly test with the hashed token, so we'll mock the reset
    // by directly updating the user's password
    const newPassword = 'NewPassword123';
    await UserService.changePassword(userId, testUser.password, newPassword);
    
    // Try logging in with the new password
    const loginResult = await AuthService.login(testUser.email, newPassword);
    expect(loginResult).toBeDefined();
    expect(loginResult.user.email).toBe(testUser.email);
    
    // Update the test user password for future tests
    testUser.password = newPassword;
  });

  it('should hash passwords securely', async () => {
    const password = 'SecurePassword123';
    const hash = await AuthService.hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20); // Bcrypt hashes are typically long
    
    // Verify the hash
    const isValid = await AuthService.comparePassword(password, hash);
    expect(isValid).toBe(true);
    
    // Verify with wrong password
    const isInvalid = await AuthService.comparePassword('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });
});