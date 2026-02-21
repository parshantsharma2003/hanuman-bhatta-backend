import { NextFunction, Request, Response } from 'express';

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 120;

const ipBuckets = new Map<string, { count: number; windowStart: number }>();

export const analyticsRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = (req.ip || req.socket.remoteAddress || 'unknown').toString();
  const now = Date.now();
  const bucket = ipBuckets.get(ip);

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    ipBuckets.set(ip, { count: 1, windowStart: now });
    next();
    return;
  }

  if (bucket.count >= MAX_REQUESTS) {
    res.status(429).json({
      success: false,
      message: 'Too many analytics requests. Please try again later.',
    });
    return;
  }

  bucket.count += 1;
  ipBuckets.set(ip, bucket);
  next();
};
