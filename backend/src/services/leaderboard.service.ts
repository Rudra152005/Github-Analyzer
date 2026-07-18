import { User } from '../models/User';
import { Repository } from '../models/Repository';
import { cacheGet, cacheSet } from '../config/redis';
import { calcLeaderboardScore } from './score.service';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  repositories: number;
  contributions: number;
  streak: number;
  followers: number;
}

type TimeRange = 'week' | 'month' | 'year' | 'all';

const CATEGORY_LANGS: Record<string, string[]> = {
  frontend: ['TypeScript', 'JavaScript', 'Vue', 'Svelte', 'HTML', 'CSS', 'React'],
  backend: ['Python', 'Go', 'Ruby', 'Java', 'Rust', 'PHP', 'C#', 'C++', 'Node'],
  devops: ['Shell', 'Dockerfile', 'HCL', 'YAML', 'Makefile'],
  'ai-ml': ['Python', 'Jupyter Notebook', 'R', 'Julia'],
};

export async function getLeaderboard(
  timeRange: TimeRange = 'month',
  category = 'all',
  limit = 50,
  userId?: string
): Promise<LeaderboardEntry[]> {
  const cacheKey = `leaderboard:${timeRange}:${category}:${limit}`;
  const cached = await cacheGet<LeaderboardEntry[]>(cacheKey);
  if (cached) return cached;

  const seededUsernames = ['sarahcodes', 'devmaster', 'codewizard', 'alexjohnson'];
  const query: Record<string, any> = {
    username: { $nin: seededUsernames },
    'privacy.showInLeaderboards': true,
  };

  // Filter users by category dynamically based on their indexed repository languages
  if (category !== 'all') {
    const allowedLangs = CATEGORY_LANGS[category] || [];
    const matchingRepos = await Repository.find({
      language: { $in: allowedLangs.map((l) => new RegExp(`^${l}$`, 'i')) },
    }).select('userId').lean();

    const matchedUserIds = [...new Set(matchingRepos.map((r) => String(r.userId)))];
    query._id = { $in: matchedUserIds };
  }

  // Find all matching registered users on the website
  const dbUsers = await User.find(query)
    .sort({ leaderboardScore: -1 })
    .limit(limit)
    .lean();

  // Safe fallback to avoid blank leaderboard in sandbox/empty databases
  let usersToMap = dbUsers;
  if (dbUsers.length === 0) {
    usersToMap = await User.find({ 'privacy.showInLeaderboards': true })
      .sort({ leaderboardScore: -1 })
      .limit(limit)
      .lean();
  }

  const entries: LeaderboardEntry[] = usersToMap.map((u, idx) => ({
    rank: idx + 1,
    username: u.username,
    avatar: u.avatar,
    score: u.leaderboardScore || 5,
    repositories: u.publicRepos,
    contributions: u.contributions,
    streak: u.streak,
    followers: u.followers,
  }));

  await cacheSet(cacheKey, entries, 300);
  return entries;
}

/** Recompute and save leaderboard score for a user */
export async function updateLeaderboardScore(
  userId: string,
  totalStars: number
): Promise<void> {
  const user = await User.findById(userId);
  if (!user) return;

  const score = calcLeaderboardScore({
    contributions: user.contributions,
    streak: user.streak,
    publicRepos: user.publicRepos,
    followers: user.followers,
    totalStars,
  });

  await User.findByIdAndUpdate(userId, { leaderboardScore: score });
}
