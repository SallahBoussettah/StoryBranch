import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { prisma } from '../config/database';
import { UserRole } from '../generated/prisma';
import authRoutes from '../routes/auth.routes';
import { errorHandler } from '../middleware/error.middleware';

describe('Auth Controller', () => {
    // Create a test app
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);

    const testUser = {
        email: `controller-test-${Date.now()}@example.com`,
        username: `controllertest${Date.now()}`,
        password: 'TestPassword123',
        role: UserRole.READER
    };

    let userId: string;
    let accessToken: string;
    let refreshToken: string;

    // Clean up after tests
    afterAll(async () => {
        // Delete test user if it exists
        if (userId) {
            await prisma.user.delete({ where: { id: userId } });
        }
    });

    it('should register a new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toBeDefined();
        expect(response.body.data.user).toBeDefined();
        expect(response.body.data.user.email).toBe(testUser.email);
        expect(response.body.data.user.username).toBe(testUser.username);
        expect(response.body.data.tokens).toBeDefined();
        expect(response.body.data.tokens.accessToken).toBeDefined();
        expect(response.body.data.tokens.refreshToken).toBeDefined();

        // Save user ID and tokens for later tests
        userId = response.body.data.user.id;
        accessToken = response.body.data.tokens.accessToken;
        refreshToken = response.body.data.tokens.refreshToken;
    });

    it('should fail registration with invalid data', async () => {
        const invalidUser = {
            email: 'invalid-email',
            username: 'u', // Too short
            password: 'weak'
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(invalidUser);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
    });

    it('should login a user', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toBeDefined();
        expect(response.body.data.user).toBeDefined();
        expect(response.body.data.user.email).toBe(testUser.email);
        expect(response.body.data.tokens).toBeDefined();
    });

    it('should fail login with incorrect credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'WrongPassword123'
            });

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('fail');
    });

    it('should refresh tokens', async () => {
        const response = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toBeDefined();
        expect(response.body.data.tokens).toBeDefined();
        expect(response.body.data.tokens.accessToken).toBeDefined();
        expect(response.body.data.tokens.refreshToken).toBeDefined();

        // Update tokens for later tests
        accessToken = response.body.data.tokens.accessToken;
        refreshToken = response.body.data.tokens.refreshToken;
    });

    it('should get user profile with valid token', async () => {
        const response = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toBeDefined();
        expect(response.body.data.user).toBeDefined();
        expect(response.body.data.user.email).toBe(testUser.email);
        expect(response.body.data.user.username).toBe(testUser.username);
    });

    it('should fail to get profile without token', async () => {
        const response = await request(app)
            .get('/api/auth/profile');

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('fail');
    });

    it('should request password reset', async () => {
        const response = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: testUser.email });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBeDefined();
    });

    it('should handle password reset request for non-existent email', async () => {
        const response = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'nonexistent@example.com' });

        // Should still return 200 for security (don't reveal if email exists)
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });

    // Note: We can't fully test the reset-password endpoint in an integration test
    // because we don't have access to the actual reset token that would be sent via email
    it('should attempt password reset', async () => {
        const response = await request(app)
            .post('/api/auth/reset-password')
            .send({
                token: 'test-token',
                password: 'NewPassword123'
            });

        // This will fail because the token is invalid, but we're testing the endpoint exists
        expect(response.status).toBe(500); // In a real app with a valid token, this would be 200
    });
});