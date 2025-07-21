import express, { Request, Response } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

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
import storyRoutes from './routes/story.routes';
import storyVersionRoutes from './routes/story-version.routes';
import nodeRoutes from './routes/node.routes';
import choiceRoutes from './routes/choice.routes';

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
app.use('/api/stories', storyRoutes);
app.use('/api', storyVersionRoutes); // Using /api prefix for version routes
app.use('/api/nodes', nodeRoutes);
app.use('/api/choices', choiceRoutes);

// Serve static files from the frontend build directory in production
if (env.isProduction) {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  
  // For any routes that don't match API routes, serve the frontend index.html
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // In development, we'll set up a catch-all route that returns a more helpful message
  app.get('*', (req: Request, res: Response) => {
    // Skip API routes - they should be handled by the notFoundHandler
    if (req.path.startsWith('/api/')) {
      return notFoundHandler(req, res);
    }
    
    // For frontend routes, explain that they need to be accessed through the frontend dev server
    res.status(200).json({
      status: 'info',
      message: 'This is a frontend route that should be accessed through the frontend development server.',
      note: 'In production, this would serve the frontend application.',
      requestedPath: req.path
    });
  });
}

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