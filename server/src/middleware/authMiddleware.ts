import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '@/utils//responseUtil';
import { getUserByRole } from '@/utils/modelUtils';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: string;
        email?: string;
        tokenVersion?: number;
      };
    }
  }
}

/**
 * Middleware to authenticate users using JWT
 * Gets token from cookies, verifies it, and adds user info to request
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      sendError(res, 401, 'Not authorized, no token');
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        role: string;
        email: string;
        tokenVersion: number;
      };

      // Validate tokenVersion against database for single device login
      const user = await getUserByRole(decoded.role, decoded.email, '+tokenVersion');

      if (!user) {
        sendError(res, 401, 'User not found');
        return;
      }

      // Check if tokenVersion matches (single device login enforcement)
      if (user.tokenVersion !== decoded.tokenVersion) {
        sendError(res, 401, 'Token invalidated - user logged in from another device');
        return;
      }

      // Add user info to request
      req.user = {
        id: decoded.id,
        role: decoded.role
      };
      next();
    } catch (error) {
      sendError(res, 401, 'Not authorized, token failed');
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    sendError(res, 500, 'Server error');
    return;
  }
};

/**
 * Middleware to restrict access to specific roles
 * Must be used after the protect middleware
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      sendError(res, 403, `Role (${req.user.role}) is not authorized to access this route`);
      return;
    }
    next();
  };
};


export interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
    email?: string;
    tokenVersion?: number;
  };
}