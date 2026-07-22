import { Request, Response } from 'express';
import { User } from '../models/User';
import { decrypt } from '../utils/encryption';
import { fetchPublicProfile, fetchContributionCalendar, calcStreak, fetchGitHubRepos } from '../services/github.service';
import { compareUsers } from '../services/gemini.service';
import { AppError } from '../middleware/errorHandler';
import { cacheGet, cacheSet } from '../config/redis';

export async function compareHandler(req: Request, res: Response): Promise<void> {
  const { user1: username1, user2: username2 } = req.body as { user1: string; user2: string };

  if (!username1 || !username2) {
    throw new AppError('Both user1 and user2 are required', 400);
  }

  const cacheKey = `compare:v3:${[username1, username2].sort().join(':')}`;
  const cached = await cacheGet(cacheKey);
  if (cached) { res.json(cached); return; }

  // 1. Fetch public profiles
  const [profile1, profile2] = await Promise.all([
    fetchPublicProfile(username1),
    fetchPublicProfile(username2),
  ]);

  if (!profile1) throw new AppError(`GitHub user "${username1}" not found`, 404);
  if (!profile2) throw new AppError(`GitHub user "${username2}" not found`, 404);

  // 2. Fetch public repos for project complexity & tech stack comparison
  const [repos1, repos2] = await Promise.all([
    fetchGitHubRepos('', username1).catch(() => []),
    fetchGitHubRepos('', username2).catch(() => []),
  ]);

  // Compute stars, forks, languages, and complexity for user 1
  const stars1 = repos1.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const forks1 = repos1.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  const langs1 = Array.from(new Set(repos1.map((r) => r.language).filter(Boolean))) as string[];
  const avgComplexity1 = Math.round(
    repos1.length
      ? repos1.reduce((acc, r) => acc + Math.min(95, Math.max(50, 40 + (r.stargazers_count || 0) * 0.5 + (r.forks_count || 0))), 0) / repos1.length
      : 70
  );

  // Compute stars, forks, languages, and complexity for user 2
  const stars2 = repos2.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const forks2 = repos2.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  const langs2 = Array.from(new Set(repos2.map((r) => r.language).filter(Boolean))) as string[];
  const avgComplexity2 = Math.round(
    repos2.length
      ? repos2.reduce((acc, r) => acc + Math.min(95, Math.max(50, 40 + (r.stargazers_count || 0) * 0.5 + (r.forks_count || 0))), 0) / repos2.length
      : 70
  );

  // 3. Extract accurate lifetime contributions & streak from profiles
  const contributions1 = profile1.contributions || 0;
  const contributions2 = profile2.contributions || 0;
  const streak1 = profile1.streak || 0;
  const streak2 = profile2.streak || 0;

  const stats1 = {
    repositories: profile1.publicRepos,
    followers: profile1.followers,
    contributions: contributions1,
    streak: streak1,
    stars: stars1,
    forks: forks1,
    languages: langs1,
    avgComplexity: avgComplexity1,
  };
  const stats2 = {
    repositories: profile2.publicRepos,
    followers: profile2.followers,
    contributions: contributions2,
    streak: streak2,
    stars: stars2,
    forks: forks2,
    languages: langs2,
    avgComplexity: avgComplexity2,
  };

  // Determine overall winner using a weighted engineering scorecard
  const score1 = 
    stats1.repositories * 0.15 + 
    stats1.followers * 0.10 + 
    stats1.contributions * 0.40 + 
    stats1.streak * 0.20 +
    stats1.avgComplexity * 0.15;

  const score2 = 
    stats2.repositories * 0.15 + 
    stats2.followers * 0.10 + 
    stats2.contributions * 0.40 + 
    stats2.streak * 0.20 +
    stats2.avgComplexity * 0.15;

  const winner: 'user1' | 'user2' | 'tie' =
    score1 > score2 ? 'user1' : score2 > score1 ? 'user2' : 'tie';

  // AI summary comparing their strengths
  const analysis = await compareUsers(
    { username: username1, contributions: contributions1, streak: streak1, publicRepos: profile1.publicRepos, followers: profile1.followers, stars: stars1, forks: forks1, languages: langs1, avgComplexity: avgComplexity1 },
    { username: username2, contributions: contributions2, streak: streak2, publicRepos: profile2.publicRepos, followers: profile2.followers, stars: stars2, forks: forks2, languages: langs2, avgComplexity: avgComplexity2 }
  );

  const result = { user1: profile1, user2: profile2, stats1, stats2, winner, analysis };
  await cacheSet(cacheKey, result, 1800); // 30 min
  res.json(result);
}

export async function getPublicProfile(req: Request, res: Response): Promise<void> {
  const { username } = req.params;
  const profile = await fetchPublicProfile(username);
  if (!profile) throw new AppError(`User "${username}" not found`, 404);
  res.json(profile);
}
