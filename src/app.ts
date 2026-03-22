import 'express-async-errors';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { corsMiddleware } from './middleware/cors';
import { loggerMiddleware } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
import { env } from './config/env';

const app: Application = express();

// Trust proxy when behind a reverse proxy (Render, Vercel, etc.)
if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// ===================================
// SECURITY MIDDLEWARE
// ===================================
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// ===================================
// CORS MIDDLEWARE
// ===================================
app.use(corsMiddleware);

// ===================================
// LOGGING MIDDLEWARE
// ===================================
app.use(loggerMiddleware);

// ===================================
// BODY PARSING MIDDLEWARE
// ===================================
// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse cookies
app.use(cookieParser());

// ===================================
// COMPRESSION MIDDLEWARE
// ===================================
// Compress response bodies for all requests
app.use(compression());

// ===================================
// API ROUTES
// ===================================
app.use(`/api/${env.apiVersion}`, routes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Hanuman Bhatta API',
    version: env.apiVersion,
    documentation: `/api/${env.apiVersion}`,
  });
});

// ===================================
// ERROR HANDLING
// ===================================
// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export default app;
