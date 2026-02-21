import { Router, Request, Response } from 'express';
import { env } from '../config/env';

const router = Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (_req: Request, res: Response) => {
  const healthData = {
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.nodeEnv,
    api_version: env.apiVersion,
  };

  res.status(200).json(healthData);
});

/**
 * @route   GET /health/ping
 * @desc    Simple ping endpoint
 * @access  Public
 */
router.get('/ping', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'pong' });
});

export default router;
