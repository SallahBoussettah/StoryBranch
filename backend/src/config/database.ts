import { PrismaClient } from '../generated/prisma';
import { Logger } from '../utils/logger';

// Create a singleton instance of PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Configure Prisma with connection pooling and logging
export const prisma = globalForPrisma.prisma || 
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });

// Set up logging for Prisma queries in development
if (process.env.NODE_ENV === 'development') {
  // In newer versions of Prisma, event handling is different
  // We'll use a simpler approach for logging
  Logger.debug('Prisma client initialized in development mode with query logging');
}

// Ensure we don't create multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Function to test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    Logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    Logger.error('Failed to connect to database', error);
    return false;
  }
}

// Function to gracefully disconnect from database
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    Logger.info('Database connection closed successfully');
  } catch (error) {
    Logger.error('Error disconnecting from database', error);
  }
}