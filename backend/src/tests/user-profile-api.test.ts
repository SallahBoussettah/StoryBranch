import request from 'supertest';
import app from '../server';
import { prisma } from '../config/database';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../generated/prisma';

// Mock user data
const testUser = {
  id: '',
  email: 'test-profile-api@example.com',
  username: 'testprofileapi',
  password: 'TestPassword123',
  role: UserRole.READER
};

const adminUser = {
  id: '',
  email: 'admin-profile-api@example.com',
  username: 'adminprofileapi',
  password: 'AdminPassword123',
  role: UserRole.ADMIN
};

let userToken: string;
let adminToken: string;

// Setup and teardown
beforeAll(async () => {
  // Create test users
  const passwordHash = await AuthService.hashPassword(testUser.password);
  const user = await prisma.user.create({
    data: {
      email: testUser.email,
      username: testUser.username,
      passwordHash,
      role: testUser.role,
      preferences: { theme: 'dark', notifications: true }
    }
  });
  testUser.id = user.id;

  const adminPasswordHash = await AuthService.hashPassword(adminUser.password);
  const admin = await prisma.user.create({
    data: {
      email: adminUser.email,
      username: adminUser.username,
      passwordHash: adminPasswordHash,
      role: adminUser.role,
      preferences: { theme: 'light', notifications: false }
    }
  });
  adminUser.id = admin.id;

  // Generate tokens
  userToken = AuthService.generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  });

  adminToken = AuthService.generateToken({
    id: admin.id,
    email: admin.email,
    username: admin.username,
    role: admin.role
  });
});

afterAll(async () => {
  // Clean up test users
  await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
  await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
  await prisma.$disconnect();
});

describe('User Profile API', () => {
  describe('GET /api/users/me', () => {
    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id', testUser.id);
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).toHaveProperty('username', testUser.username);
      expect(response.body.data.user).toHaveProperty('role', testUser.role);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/users/me');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/me/detailed', () => {
    it('should return detailed user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/me/detailed')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id', testUser.id);
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data).toHaveProperty('achievements');
      expect(response.body.data).toHaveProperty('readingProgress');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/users/me/detailed');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update user profile when authenticated', async () => {
      const updateData = {
        preferences: { theme: 'light', notifications: false }
      };

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.preferences).toHaveProperty('theme', 'light');
      expect(response.body.data.user.preferences).toHaveProperty('notifications', false);
    });

    it('should return 400 when providing invalid data', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/users/me/role-upgrade', () => {
    it('should request role upgrade when authenticated as reader', async () => {
      const response = await request(app)
        .post('/api/users/me/role-upgrade')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Role upgrade request submitted successfully');
      expect(response.body.data.user.preferences).toHaveProperty('roleUpgradeRequested', true);
    });

    it('should return 400 when already a writer or admin', async () => {
      const response = await request(app)
        .post('/api/users/me/role-upgrade')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/users/role-upgrade-requests', () => {
    it('should return role upgrade requests when authenticated as admin', async () => {
      const response = await request(app)
        .get('/api/users/role-upgrade-requests')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('data.users');
    });

    it('should return 403 when not an admin', async () => {
      const response = await request(app)
        .get('/api/users/role-upgrade-requests')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    it('should update user role when authenticated as admin', async () => {
      const updateData = {
        role: 'WRITER'
      };

      const response = await request(app)
        .patch(`/api/users/${testUser.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('role', 'WRITER');
    });

    it('should return 403 when not an admin', async () => {
      const updateData = {
        role: 'READER'
      };

      const response = await request(app)
        .patch(`/api/users/${adminUser.id}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
    });
  });
});