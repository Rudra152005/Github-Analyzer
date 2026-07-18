import { Queue } from 'bullmq';
import { redis } from '../../config/redis';

export const reportQueue = new Queue('reports', {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export async function enqueueReportJob(reportId: string, userId: string, type: string) {
  return reportQueue.add('generate', { reportId, userId, type });
}
