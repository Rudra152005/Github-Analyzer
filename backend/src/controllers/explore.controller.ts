import { Request, Response } from 'express';
import {
  getTrendingTopics,
  getTopUsers,
  searchExplore,
  getTrendingRepos as fetchTrendingReposFromService,
} from '../services/explore.service';

export async function getTrendingRepos(req: Request, res: Response): Promise<void> {
  const q = req.query.q as string | undefined;
  const repos = await fetchTrendingReposFromService(q);
  res.json(repos);
}

export async function getTrendingTopicsHandler(req: Request, res: Response): Promise<void> {
  const topics = await getTrendingTopics();
  res.json(topics);
}

export async function getTopUsersHandler(req: Request, res: Response): Promise<void> {
  const users = await getTopUsers(10, req.session.userId);
  res.json(users);
}
 
export async function searchHandler(req: Request, res: Response): Promise<void> {
  const { q = '', type = 'repos' } = req.query as { q?: string; type?: string };
  const results = await searchExplore(q, type, req.session.userId);
  res.json(results);
}
