const { PrismaClient } = require('../generated/prisma');
const { UserService } = require('../services/user.service');
const { UserRole } = require('../generated/prisma');

const prisma = new PrismaClient();

async function testUserModel() {
  try {
    console.log('Testing User Model...');
    
    // Test creating a user
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'TestPassword123',
      role: UserRole.READER
    };
    
    console.log(`Creating test user: ${testUser.email}`);
    const user = await UserService.createUser(testUser);
    console.log(`User created with ID: ${user.id}`);
    
    // Test getting user by ID
    console.log(`Getting user by ID: ${user.id}`);
    const retrievedUser = await UserService.getUserById(user.id);
    console.log(`Retrieved user: ${retrievedUser.email}`);
    
    // Test updating user
    console.log('Updating user...');
    const updatedUser = await UserService.updateUser(user.id, {
      username: `updated-${testUser.username}`,
      preferences: { theme: 'dark' }
    });
    console.log(`User updated: ${updatedUser.username}`);
    
    // Clean up
    console.log('Cleaning up...');
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Test user deleted');
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error testing user model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserModel();