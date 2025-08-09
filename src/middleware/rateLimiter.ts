import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max 100 requests per window

  // Clean up expired entries
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });

  // Initialize or get client data
  if (!store[clientIP]) {
    store[clientIP] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  const clientData = store[clientIP];

  // Reset if window has expired
  if (clientData.resetTime < now) {
    clientData.count = 0;
    clientData.resetTime = now + windowMs;
  }

  // Increment request count
  clientData.count++;

  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(
      0,
      maxRequests - clientData.count
    ).toString(),
    'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString(),
  });

  // Check if rate limit exceeded
  if (clientData.count > maxRequests) {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
    });
    return;
  }

  next();
};
