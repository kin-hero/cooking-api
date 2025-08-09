import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

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

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err } as any;
  error.message = err.message;

  // Log error
  console.error(err);

  // Prisma error handling
  if (err.name === 'PrismaClientKnownRequestError') {
    const message = 'Database error occurred';
    error = new AppError(message, 400);
  }

  // JWT error handling
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Validation error handling
  if (err.name === 'ZodError') {
    const message = 'Validation error';
    error = new AppError(message, 400);
  }

  const response: ApiResponse = {
    success: false,
    error: error.message || 'Server Error',
  };

  const statusCode = error.statusCode || 500;

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    response.error = 'Something went wrong';
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.originalUrl} not found`,
  };

  res.status(404).json(response);
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};