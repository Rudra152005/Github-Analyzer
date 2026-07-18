import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async route handlers to catch rejected promises
 * and forward to Express error middleware.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
