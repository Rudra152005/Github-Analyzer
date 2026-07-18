import { Worker } from 'bullmq';
import { redis } from '../../config/redis';
import { Job as JobModel } from '../../models/Job';
import { User } from '../../models/User';
import { Repository } from '../../models/Repository';
import { decrypt } from '../../utils/encryption';
import { generateInsights } from '../../services/gemini.service';
import { cacheSet } from '../../config/redis';
import { logger } from '../../utils/logger';

export const insightWorker = new Worker(
  'insights',
  async (job) => {
    const { userId, jobId } = job.data as { userId: string; jobId: string };

    await JobModel.findByIdAndUpdate(jobId, { status: 'processing' });

    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found');

    const repos = await Repository.find({ userId }).sort({ stars: -1 }).limit(15).lean();

    const insights = await generateInsights(
      repos.map((r) => ({
        name: r.name,
        language: r.language,
        stars: r.stars,
        description: r.description,
        healthScore: r.healthScore,
      })),
      {
        username: user.username,
        name: user.name,
        contributions: user.contributions,
        streak: user.streak,
      }
    );

    // Cache insights for this user (4 hours)
    await cacheSet(`insights:${userId}`, insights, 4 * 3600);

    await JobModel.findByIdAndUpdate(jobId, {
      status: 'completed',
      result: insights,
    });

    logger.info(`Insight job ${jobId} completed for user ${user.username}`);
    return insights;
  },
  {
    connection: redis as any,
    concurrency: 2,
  }
);

insightWorker.on('failed', async (job, err) => {
  if (job) {
    const { jobId } = job.data as { jobId: string };
    await JobModel.findByIdAndUpdate(jobId, {
      status: 'failed',
      error: err.message,
    });
    logger.error(`Insight job ${jobId} failed:`, err.message);
  }
});
