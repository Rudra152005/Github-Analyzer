import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { reposRouter, jobRouter } from './routes/repos.routes';
import exploreRoutes from './routes/explore.routes';
import leaderboardRoutes, { usersRouter } from './routes/leaderboard.routes';
import reportsRoutes from './routes/reports.routes';
import compareRoutes, { githubRouter } from './routes/compare.routes';
import publicRoutes from './routes/public.routes';

export function createApp() {
  const app = express();

  // ─── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ─── Logging ───────────────────────────────────────────────────────────────
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // ─── Body Parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Sessions ──────────────────────────────────────────────────────────────
  app.use(
    session({
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: env.MONGO_URI }),
      cookie: {
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
    })
  );

  // ─── Rate Limiting ─────────────────────────────────────────────────────────
  app.use('/api', apiLimiter);

  // ─── Routes ────────────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/repos', reposRouter);
  app.use('/api/jobs', jobRouter);
  app.use('/api/explore', exploreRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/users', usersRouter);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/compare', compareRoutes);
  app.use('/api/github', githubRouter);
  app.use('/api/public', publicRoutes);

  // ─── Health Check ──────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // ─── 404 ───────────────────────────────────────────────────────────────────
  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

  // ─── Error Handler ─────────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
