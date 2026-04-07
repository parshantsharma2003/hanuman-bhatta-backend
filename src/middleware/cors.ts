import cors, { CorsOptions } from 'cors';
import { env } from '../config/env';

const envOrigins = env.corsOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedVercelOrigin = (origin: string): boolean => {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'vercel.app' || hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

const allowedOrigins = [
  ...envOrigins,
  'http://localhost:3000',
  'http://localhost:3001',
  // Add production domain when deployed
  // 'https://hanumanbhatta.com',
  // 'https://www.hanumanbhatta.com',
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1 || isAllowedVercelOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      // Deny CORS for this origin without throwing an application error.
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

export { corsOptions };
export const corsMiddleware = cors(corsOptions);
export const corsPreflightMiddleware = cors(corsOptions);
