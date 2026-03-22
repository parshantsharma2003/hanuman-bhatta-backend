import { NextFunction, Request, Response } from 'express';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

const buckets = new Map<string, { count: number; windowStart: number }>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of buckets.entries()) {
    if (now - bucket.windowStart > WINDOW_MS) {
      buckets.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS);

cleanupTimer.unref();

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
