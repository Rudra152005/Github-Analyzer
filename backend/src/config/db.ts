import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected — attempting reconnect...');
});
