import { prisma, testDatabaseConnection, disconnectDatabase } from '../config/database';
import { Logger } from '../utils/logger';

async function main() {
  try {
    Logger.info('Testing database connection...');
    
    const connected = await testDatabaseConnection();
    
    if (connected) {
      Logger.info('Database connection successful!');
      
      // Test query to verify schema
      const userCount = await prisma.user.count();
      Logger.info(`User count: ${userCount}`);
      
      const storyCount = await prisma.story.count();
      Logger.info(`Story count: ${storyCount}`);
      
      Logger.info('Database schema verified successfully!');
    } else {
      Logger.error('Failed to connect to database');
    }
  } catch (error) {
    Logger.error('Error testing database connection', error);
  } finally {
    await disconnectDatabase();
  }
}

main();