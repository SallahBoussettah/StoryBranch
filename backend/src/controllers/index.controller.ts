import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';

/**
 * Controller for the API root
 */
export const getApiInfo = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Welcome to Interactive Branching Stories API',
      version: '1.0.0',
      documentation: '/api/docs'
    });
  } catch (error) {
    next(new AppError('Failed to retrieve API information', 500));
  }
};