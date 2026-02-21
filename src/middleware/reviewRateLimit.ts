import { NextFunction, Request, Response } from 'express';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

const buckets = new Map<string, { count: number; windowStart: number }>();

export const reviewSubmissionRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = (req.ip || req.socket.remoteAddress || 'unknown').toString();
  const now = Date.now();
  const current = buckets.get(ip);

  if (!current || now - current.windowStart > WINDOW_MS) {
    buckets.set(ip, { count: 1, windowStart: now });
    next();
    return;
  }

  if (current.count >= MAX_REQUESTS) {
    res.status(429).json({
      success: false,
      message: 'Too many review submissions. Please try again after some time.',
    });
    return;
  }

  current.count += 1;
  buckets.set(ip, current);
  next();
};
