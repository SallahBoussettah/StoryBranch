import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import middleware
import { setupCors } from './middleware/cors.middleware';
import { setupSecurity } from './middleware/security.middleware';
import { errorHandler, notFoundHandler, AppError } from './middleware/error.middleware';

// Import config
import env from './config/env.config';
import { prisma, testDatabaseConnection, disconnectDatabase } from './config/database';
import { Logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Import routes
import indexRoutes from './routes/index.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
// Additional routes to be implemented
// import storyRoutes from './routes/story.routes';

// Create Express app
const app = express();
const port = env.port;

// Apply security middleware
setupSecurity(app);

// Apply CORS middleware
setupCors(app);

// Body parsing middleware
app.use(express.json({ limit: '10kb' })); // Body parsing with size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging middleware
app.use(morgan(env.isProduction ? 'combined' : 'dev')); // Logging

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Interactive Branching Stories API' });
});

// API routes
app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// Additional routes to be implemented
// app.use('/api/stories', storyRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Test database connection before starting server
testDatabaseConnection()
  .then(() => {
    // Start server
    app.listen(port, () => {
      Logger.info(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    Logger.error('Failed to start server due to database connection issue', error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  Logger.info('SIGINT received, shutting down gracefully');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  Logger.info('SIGTERM received, shutting down gracefully');
  await disconnectDatabase();
  process.exit(0);
});

export default app;