import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    throw new AppError('Authentication required', 401);
  }
  next();
}

// Augment express-session types
declare module 'express-session' {
  interface SessionData {
    userId: string;
    githubUsername: string;
  }
}
