import cors from 'cors';
import { Express } from 'express';
import env from '../config/env.config';

export const setupCors = (app: Express): void => {
  // Configure CORS options
  const corsOptions = {
    origin: env.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  };

  // Apply CORS middleware
  app.use(cors(corsOptions));

  // Handle preflight requests
  app.options('*', cors(corsOptions));
};