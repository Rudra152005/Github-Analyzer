import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  // Mongoose duplicate key
  if ((err as NodeJS.ErrnoException).code === '11000') {
    res.status(409).json({ error: 'Duplicate entry' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
