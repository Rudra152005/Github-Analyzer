import { Queue } from 'bullmq';
import { redis } from '../../config/redis';

export const insightQueue = new Queue('insights', {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export async function enqueueInsightJob(userId: string, jobId: string) {
  return insightQueue.add('regenerate', { userId, jobId });
}
