import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error('Redis error:', err));

export async function connectRedis(): Promise<void> {
  if (redis.status === 'connecting' || redis.status === 'connect' || redis.status === 'ready') {
    return;
  }
  try {
    await redis.connect();
  } catch (err) {
    logger.warn('Redis not available — caching and queues disabled:', err);
  }
}

// ─── Cache helpers ───────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // ignore cache write failures
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // ignore
  }
}
