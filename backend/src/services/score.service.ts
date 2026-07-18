/**
 * Score Calculator Service
 *
 * Computes:
 * - Repository Health Score (0-100): how well-maintained a repo is
 * - Leaderboard Score (0-100): overall developer ranking score
 */

interface RepoForScore {
  stars: number;
  forks: number;
  issues: number;
  description: string;
  topics: string[];
  commits: number;
  lastUpdated: string; // ISO date string
  contributors: number;
}

/**
 * Calculate health score for a single repository.
 *
 * Factors:
 * - Recency of last push (max 30 pts)
 * - Popularity: stars + forks (max 25 pts)
 * - Documentation: description + topics (max 20 pts)
 * - Activity: commits + contributors (max 15 pts)
 * - Issue health: penalty for high issue ratio (max -20 pts)
 */
export function calcHealthScore(repo: RepoForScore): number {
  let score = 35; // Baseline score for active repositories

  // Recency (0-30)
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(repo.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceUpdate <= 7) score += 30;
  else if (daysSinceUpdate <= 30) score += 25;
  else if (daysSinceUpdate <= 90) score += 15;
  else if (daysSinceUpdate <= 365) score += 8;
  else score += 2;

  // Popularity (0-15) - Balanced for personal repositories
  const popularityRaw = Math.log10(repo.stars + 1) * 5 + Math.log10(repo.forks + 1) * 3;
  score += Math.min(15, Math.round(popularityRaw));

  // Documentation (0-15)
  if (repo.description && repo.description.length > 20) score += 8;
  else if (repo.description) score += 4;
  if (repo.topics.length >= 3) score += 7;
  else if (repo.topics.length > 0) score += 3;

  // Activity (0-15)
  score += Math.min(10, Math.round(Math.log10(repo.commits + 1) * 4));
  score += Math.min(5, repo.contributors > 1 ? 5 : 0);

  // Issue penalty (0 to -10)
  const issueRatio = repo.issues / Math.max(repo.stars + repo.forks + 10, 10);
  const penalty = Math.min(10, Math.round(issueRatio * 10));
  score -= penalty;

  return Math.max(0, Math.min(100, Math.round(score)));
}

interface UserForScore {
  contributions: number;
  streak: number;
  publicRepos: number;
  followers: number;
  totalStars: number;
}

/**
 * Calculate leaderboard score for a developer.
 *
 * Weighted formula (all normalized to 0-100):
 * - Contributions × 0.35
 * - Streak × 0.25
 * - Total Stars × 0.20
 * - Public Repos × 0.10
 * - Followers × 0.10
 */
export function calcLeaderboardScore(user: UserForScore): number {
  const normalizedContribs = Math.min(100, (user.contributions / 5000) * 100);
  const normalizedStreak = Math.min(100, (user.streak / 365) * 100);
  const normalizedStars = Math.min(100, (user.totalStars / 10000) * 100);
  const normalizedRepos = Math.min(100, (user.publicRepos / 200) * 100);
  const normalizedFollowers = Math.min(100, (user.followers / 5000) * 100);

  const raw =
    normalizedContribs * 0.35 +
    normalizedStreak * 0.25 +
    normalizedStars * 0.20 +
    normalizedRepos * 0.10 +
    normalizedFollowers * 0.10;

  return Math.round(raw);
}

/**
 * Derive weekly contributions breakdown from event data (approximation).
 */
export function buildWeeklyContributions(activityData: { date: string; count: number }[]) {
  const weeks: { week: string; commits: number; prs: number; issues: number; reviews: number }[] = [];
  const sorted = [...activityData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Last 8 weeks
  const last56 = sorted.slice(-56);
  for (let i = 0; i < last56.length; i += 7) {
    const chunk = last56.slice(i, i + 7);
    const total = chunk.reduce((s, d) => s + d.count, 0);
    const weekLabel = new Date(chunk[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    weeks.push({
      week: weekLabel,
      commits: Math.round(total * 0.55),
      prs: Math.round(total * 0.12),
      issues: Math.round(total * 0.13),
      reviews: Math.round(total * 0.20),
    });
  }
  return weeks;
}

/**
 * Build monthly growth from repository history (approximation).
 */
export function buildMonthlyGrowth(
  currentStars: number,
  currentFollowers: number
): { month: string; stars: number; followers: number }[] {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const growthRate = 1.05;
  const result = [];

  let stars = Math.round(currentStars / Math.pow(growthRate, 5));
  let followers = Math.round(currentFollowers / Math.pow(growthRate, 5));

  for (const month of months) {
    result.push({ month, stars, followers });
    stars = Math.round(stars * growthRate);
    followers = Math.round(followers * growthRate);
  }
  return result;
}
