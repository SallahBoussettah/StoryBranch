import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/auth.service';
import { AppError } from './error.middleware';
import { UserRole } from '../generated/prisma';
import { prisma } from '../config/database';
import { Logger } from '../utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to protect routes - verifies JWT token
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access based on user roles
 */
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists on request (should be set by protect middleware)
    if (!req.user) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

/**
 * Middleware to check if user is accessing their own resource
 * Used for routes where a user should only access their own data
 */
export const isResourceOwner = (paramIdField: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists on request (should be set by protect middleware)
    if (!req.user) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // Get resource ID from request parameters
    const resourceId = req.params[paramIdField];

    // If user is admin, allow access
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // Check if user is accessing their own resource
    if (resourceId !== req.user.id) {
      return next(new AppError('You do not have permission to access this resource.', 403));
    }

    next();
  };
};