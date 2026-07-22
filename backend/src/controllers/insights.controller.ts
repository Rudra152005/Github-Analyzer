import { Request, Response } from 'express';
import { User } from '../models/User';
import { Repository } from '../models/Repository';
import { Job } from '../models/Job';
import { AppError } from '../middleware/errorHandler';
import { generateInsights } from '../services/gemini.service';
import { fetchGitHubRepos, mapGitHubRepo } from '../services/github.service';
import { decrypt } from '../utils/encryption';
import { cacheGet, cacheSet } from '../config/redis';
import { enqueueInsightJob } from '../jobs/queues/insightQueue';
import { logger } from '../utils/logger';

export async function getInsights(req: Request, res: Response): Promise<void> {
  const userId = req.session.userId!;
  const cacheKey = `insights:v5:${userId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) { res.json(cached); return; }

  const user = await User.findById(userId).lean();
  if (!user) throw new AppError('User not found', 404);

  let repos = await Repository.find({ userId }).sort({ stars: -1 }).limit(20).lean();

  if (repos.length === 0) {
    try {
      const token = decrypt(user.githubAccessToken || '');
      const ghRepos = await fetchGitHubRepos(token, user.username);
      const mapped = ghRepos.map(mapGitHubRepo);
      await Promise.all(
        mapped.map((m) =>
          Repository.findOneAndUpdate(
            { userId, githubId: m.githubId },
            { userId, ...m, cachedAt: new Date() },
            { upsert: true, new: true }
          )
        )
      );
      repos = await Repository.find({ userId }).sort({ stars: -1 }).limit(20).lean();
    } catch (err: any) {
      logger.warn(`Failed to auto-fetch repos for insights: ${err.message}`);
    }
  }

  const insights = await generateInsights(
    repos.map((r) => ({
      name: r.name,
      language: r.language,
      stars: r.stars,
      description: r.description,
      healthScore: r.healthScore,
    })),
    { username: user.username, name: user.name, contributions: user.contributions, streak: user.streak }
  );

  await cacheSet(cacheKey, insights, 4 * 3600);
  res.json(insights);
}

export async function regenerateInsights(req: Request, res: Response): Promise<void> {
  const userId = req.session.userId!;

  // Create job record
  const jobDoc = await Job.create({
    type: 'insight_regenerate',
    userId,
    status: 'queued',
  });

  // Enqueue
  const bullJob = await enqueueInsightJob(userId, String(jobDoc._id));
  await Job.findByIdAndUpdate(jobDoc._id, { bullJobId: String(bullJob.id) });

  res.json({ jobId: String(jobDoc._id) });
}

export async function getJob(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  const job = await Job.findById(jobId).lean();
  if (!job) throw new AppError('Job not found', 404);
  if (job.userId !== req.session.userId) throw new AppError('Unauthorized', 403);

  res.json({
    status: job.status,
    result: job.result ?? null,
    error: job.error ?? null,
  });
}
