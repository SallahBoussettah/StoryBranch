import { Request, Response, NextFunction } from 'express';
import env from '../config/env.config';

// Create custom error class
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default values if err is not an AppError
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const status = 'status' in err ? err.status : 'error';
  const isOperational = 'isOperational' in err ? err.isOperational : false;

  // Different error responses based on environment
  if (env.isProduction) {
    // Production: clean error
    if (isOperational) {
      return res.status(statusCode).json({
        status,
        message: err.message,
      });
    }
    // Programming or unknown error: don't leak error details
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  } else {
    // Development: full error
    return res.status(statusCode).json({
      status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};