import mongoose from 'mongoose';
import { env, isDevelopment } from './env';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri);

    if (isDevelopment) {
      mongoose.set('debug', false);
    }

    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};
