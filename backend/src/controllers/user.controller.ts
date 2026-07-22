import { Request, Response } from 'express';
import { User } from '../models/User';
import { Repository } from '../models/Repository';
import { AppError } from '../middleware/errorHandler';
import { toUserProfile, toRepository } from '../utils/dto-mappers';
import {
  fetchGitHubProfile,
  fetchGitHubRepos,
  fetchContributionCalendar,
  fetchLanguageStats,
  mapGitHubRepo,
  calcStreak,
  fetchRepoExtraStats,
} from '../services/github.service';
import {
  calcHealthScore,
  buildWeeklyContributions,
  buildMonthlyGrowth,
} from '../services/score.service';
import { updateLeaderboardScore } from '../services/leaderboard.service';
import { generateSkillRadar } from '../services/gemini.service';
import { decrypt } from '../utils/encryption';
import { cacheGet, cacheSet } from '../config/redis';

async function getTokenAndUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  const token = decrypt(user.githubAccessToken || '');
  return { user, token };
}

// ─── GET /api/user/me ─────────────────────────────────────────────────────────

export async function getProfile(req: Request, res: Response): Promise<void> {
  const { user, token } = await getTokenAndUser(req.session.userId!);

  const fresh = await fetchGitHubProfile(token, user.username);
  Object.assign(user, fresh);

  // Always use DB repo count as source of truth (more reliable than scraped HTML)
  const dbReposCount = await Repository.countDocuments({ userId: String(user._id) });
  if (dbReposCount > 0) {
    user.publicRepos = dbReposCount;
  }

  user.lastSyncedAt = new Date();
  await user.save();

  res.json(toUserProfile(user));
}

// ─── GET /api/user/me/repos ───────────────────────────────────────────────────

export async function getRepos(req: Request, res: Response): Promise<void> {
  const { user, token } = await getTokenAndUser(req.session.userId!);
  const { sort = 'stars', q = '' } = req.query as { sort?: string; q?: string };

  // Fetch fresh repos from GitHub (REST API → HTML scrape fallback)
  const ghRepos = await fetchGitHubRepos(token, user.username);

  if (ghRepos.length === 0) {
    res.json([]);
    return;
  }

  // Delete all existing repo docs for this user so stale 0-star rows are gone
  await Repository.deleteMany({ userId: String(user._id) });

  // Map + calculate health scores + persist in DB
  const repoUpdates = await Promise.all(
    ghRepos.map(async (r, index) => {
      const mapped = mapGitHubRepo(r);

      let commits: number | undefined;
      let contributors: number | undefined;
      let branches: number | undefined;

      // Try to fetch extra stats for top repos if authenticated
      if (token && token !== 'mock_github_token_for_seeding' && index < 5) {
        const ownerName = (r as any).owner?.login || user.username;
        const stats = await fetchRepoExtraStats(token, ownerName, r.name).catch(() => null);
        if (stats) {
          commits = stats.commits;
          contributors = stats.contributors;
          branches = stats.branches;
        }
      }

      // Stable fallbacks (no random numbers)
      commits = commits ?? Math.max(1, Math.round(r.stargazers_count * 0.1));
      contributors = contributors ?? Math.max(1, Math.round(r.forks_count * 0.1));
      branches = branches ?? 1;

      const healthScore = calcHealthScore({
        ...mapped,
        commits,
        contributors,
        lastUpdated: mapped.lastUpdated,
        topics: mapped.topics,
      });

      const repoDoc = {
        userId: String(user._id),
        ...mapped,
        commits,
        contributors,
        branches,
        healthScore,
        cachedAt: new Date(),
      };

      const saved = await Repository.create(repoDoc);
      return { ...repoDoc, id: String(saved._id) };
    })
  );

  // Update publicRepos count and leaderboard
  const totalStars = repoUpdates.reduce((s, r) => s + (r.stars || 0), 0);
  user.publicRepos = repoUpdates.length;
  await user.save();
  await updateLeaderboardScore(String(user._id), totalStars);

  // Filter + sort
  let filtered = repoUpdates.filter(
    (r) =>
      !q ||
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.description.toLowerCase().includes(q.toLowerCase())
  );

  const mappedResults = filtered.map((r) => toRepository(r));

  if (sort === 'stars') mappedResults.sort((a, b) => b.stars - a.stars);
  else if (sort === 'updated') mappedResults.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  else if (sort === 'health') mappedResults.sort((a, b) => b.healthScore - a.healthScore);
  else if (sort === 'complexity') mappedResults.sort((a, b) => b.complexityScore - a.complexityScore);
  else if (sort === 'market') mappedResults.sort((a, b) => b.marketRelevance - a.marketRelevance);

  res.json(mappedResults);
}

// ─── GET /api/user/me/activity ────────────────────────────────────────────────

export async function getActivity(req: Request, res: Response): Promise<void> {
  const { user, token } = await getTokenAndUser(req.session.userId!);
  const activity = await fetchContributionCalendar(token, user.username);

  // Update streak
  const streak = calcStreak(activity);
  if (streak !== user.streak) {
    user.streak = streak;
    await user.save();
  }

  res.json(activity);
}

// ─── GET /api/user/me/languages ───────────────────────────────────────────────

export async function getLanguages(req: Request, res: Response): Promise<void> {
  const { user, token } = await getTokenAndUser(req.session.userId!);

  // Read from DB repos (populated by getRepos) to avoid extra GitHub API calls
  const dbRepos = await Repository.find({ userId: String(user._id) }).lean();

  if (dbRepos.length > 0) {
    // Build language stats directly from DB repos (no API calls needed)
    const langCounts: Record<string, number> = {};
    const langRepos: Record<string, number> = {};
    for (const r of dbRepos) {
      const lang = r.language || '';
      if (lang && lang !== 'Unknown') {
        langCounts[lang] = (langCounts[lang] ?? 0) + 1000;
        langRepos[lang] = (langRepos[lang] ?? 0) + 1;
      }
    }
    const total = Object.values(langCounts).reduce((a, b) => a + b, 0);
    if (total > 0) {
      const stats = Object.entries(langCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([lang, count]) => {
          const LANG_COLORS: Record<string, string> = {
            TypeScript: '#3178c6', JavaScript: '#f7df1e', Python: '#3776ab',
            Go: '#00add8', Rust: '#dea584', Java: '#b07219', 'C++': '#f34b7d',
            C: '#555555', 'C#': '#178600', PHP: '#4F5D95', Ruby: '#701516',
            Shell: '#89e051', Kotlin: '#A97BFF', Swift: '#ffac45', HTML: '#e34c26',
            CSS: '#563d7c', Vue: '#41b883', Svelte: '#ff3e00',
          };
          return {
            language: lang,
            percentage: Math.round((count / total) * 100),
            color: LANG_COLORS[lang] ?? '#8b949e',
            repos: langRepos[lang] ?? 1,
          };
        });
      res.json(stats);
      return;
    }
  }

  // Fallback: fetch from GitHub API
  const ghRepos = await fetchGitHubRepos(token, user.username);
  const languages = await fetchLanguageStats(token, user.username, ghRepos);
  res.json(languages);
}

// ─── GET /api/user/me/growth ──────────────────────────────────────────────────

export async function getGrowth(req: Request, res: Response): Promise<void> {
  const { user } = await getTokenAndUser(req.session.userId!);
  const repos = await Repository.find({ userId: String(user._id) }).lean();
  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const growth = buildMonthlyGrowth(totalStars, user.followers);
  res.json(growth);
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalyticsSummary(req: Request, res: Response): Promise<void> {
  const { user, token } = await getTokenAndUser(req.session.userId!);
  const activity = await fetchContributionCalendar(token, user.username);
  const weekly = buildWeeklyContributions(activity);
  const total = weekly.reduce(
    (acc, w) => ({
      commits: acc.commits + w.commits,
      prs: acc.prs + w.prs,
      issues: acc.issues + w.issues,
      reviews: acc.reviews + w.reviews,
    }),
    { commits: 0, prs: 0, issues: 0, reviews: 0 }
  );
  res.json({
    ...total,
    changes: { commits: '+23%', prs: '+12%', issues: '+8%', reviews: '+45%' },
    commitsChange: '+23%',
    prsChange: '+12%',
    issuesChange: '+8%',
    reviewsChange: '+45%',
  });
}

export async function getAnalyticsWeekly(req: Request, res: Response): Promise<void> {
  const { user, token } = await getTokenAndUser(req.session.userId!);
  const activity = await fetchContributionCalendar(token, user.username);
  res.json(buildWeeklyContributions(activity));
}

export async function getAnalyticsSkills(req: Request, res: Response): Promise<void> {
  const { user } = await getTokenAndUser(req.session.userId!);
  const cacheKey = `skills:${String(user._id)}`;
  const cached = await cacheGet(cacheKey);
  if (cached) { res.json(cached); return; }

  const repos = await Repository.find({ userId: String(user._id) }).lean();
  const skillData = await generateSkillRadar(repos);
  await cacheSet(cacheKey, skillData, 6 * 3600); // 6h
  res.json(skillData);
}

export async function getAnalyticsGrowth(req: Request, res: Response): Promise<void> {
  const { user } = await getTokenAndUser(req.session.userId!);
  const repos = await Repository.find({ userId: String(user._id) }).lean();
  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  res.json(buildMonthlyGrowth(totalStars, user.followers));
}
