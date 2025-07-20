import { PrismaClient, UserRole } from '../generated/prisma';
import { UserService } from '../services/user.service';
import { Logger } from '../utils/logger';

const prisma = new PrismaClient();

async function testUserModel() {
  try {
    Logger.info('Testing User Model...');

    // Test creating a user
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'TestPassword123',
      role: UserRole.READER
    };

    Logger.info(`Creating test user: ${testUser.email}`);
    const user = await UserService.createUser(testUser);
    Logger.info(`User created with ID: ${user.id}`);

    // Test getting user by ID
    Logger.info(`Getting user by ID: ${user.id}`);
    const retrievedUser = await UserService.getUserById(user.id);
    Logger.info(`Retrieved user: ${retrievedUser.email}`);

    // Test updating user
    Logger.info('Updating user...');
    const updatedUser = await UserService.updateUser(user.id, {
      username: `updated_${testUser.username}`,
      preferences: { theme: 'dark' }
    });
    Logger.info(`User updated: ${updatedUser.username}`);

    // Clean up
    Logger.info('Cleaning up...');
    await prisma.user.delete({ where: { id: user.id } });
    Logger.info('Test user deleted');

    Logger.info('All tests passed!');
  } catch (error) {
    Logger.error('Error testing user model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserModel();