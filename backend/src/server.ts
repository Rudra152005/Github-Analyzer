import { createApp } from './app';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { env } from './config/env';
import { logger } from './utils/logger';

// Import workers to register them
import './jobs/workers/insightWorker';
import './jobs/workers/reportWorker';

async function bootstrap() {
  // Connect to DB and Redis
  await connectDB();
  await connectRedis();

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`🚀 DevPulse backend running on http://localhost:${env.PORT}`);
    logger.info(`   Environment: ${env.NODE_ENV}`);
    logger.info(`   Frontend URL: ${env.FRONTEND_URL}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
    process.exit(1);
  });
}

bootstrap();
