import { Request, Response } from 'express';
import { getLeaderboard } from '../services/leaderboard.service';
import { fetchPublicProfile } from '../services/github.service';
import { AppError } from '../middleware/errorHandler';

export async function getLeaderboardHandler(req: Request, res: Response): Promise<void> {
  const { timeRange = 'month', category = 'all' } = req.query as {
    timeRange?: 'week' | 'month' | 'year' | 'all';
    category?: string;
  };
  const entries = await getLeaderboard(timeRange, category, 50, req.session.userId);
  res.json(entries);
}

export async function getUserProfile(req: Request, res: Response): Promise<void> {
  const { username } = req.params;
  const profile = await fetchPublicProfile(username);
  if (!profile) throw new AppError(`User "${username}" not found`, 404);
  res.json(profile);
}
