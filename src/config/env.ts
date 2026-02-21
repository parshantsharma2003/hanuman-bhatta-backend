import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  // Server
  nodeEnv: string;
  port: number;
  
  // CORS
  corsOrigin: string;
  
  // API
  apiVersion: string;

  // Database
  mongoUri: string;

  // Auth
  jwtSecret: string;
  jwtExpiresIn: string;
  cookieName: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  
  // Contact
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  
  // Business
  bricksPerTrolley: number;
  wastagePercentage: number;
  
  // Cloudinary
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const env: EnvConfig = {
  // Server
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: getEnvNumber('PORT', 5000),
  
  // CORS
  corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
  
  // API
  apiVersion: getEnvVar('API_VERSION', 'v1'),

  // Database
  mongoUri: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/hanuman-bhatta'),

  // Auth
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '12h'),
  cookieName: getEnvVar('AUTH_COOKIE_NAME', 'hb_admin_token'),
  adminEmail: getEnvVar('ADMIN_EMAIL'),
  adminPassword: getEnvVar('ADMIN_PASSWORD'),
  adminName: getEnvVar('ADMIN_NAME', 'Hanuman Bhatta Admin'),
  
  // Contact
  whatsappNumber: getEnvVar('WHATSAPP_NUMBER'),
  contactEmail: getEnvVar('CONTACT_EMAIL'),
  contactPhone: getEnvVar('CONTACT_PHONE'),
  
  // Business
  bricksPerTrolley: getEnvNumber('BRICKS_PER_TROLLEY', 3000),
  wastagePercentage: getEnvNumber('WASTAGE_PERCENTAGE', 5),
  
  // Cloudinary
  cloudinaryCloudName: getEnvVar('CLOUDINARY_CLOUD_NAME', ''),
  cloudinaryApiKey: getEnvVar('CLOUDINARY_API_KEY', ''),
  cloudinaryApiSecret: getEnvVar('CLOUDINARY_API_SECRET', ''),
};

export const isDevelopment = env.nodeEnv === 'development';
export const isProduction = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';

export default env;
