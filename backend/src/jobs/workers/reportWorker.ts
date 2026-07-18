import { Worker } from 'bullmq';
import { redis } from '../../config/redis';
import { Report } from '../../models/Report';
import { generatePDF, buildReportData, markReportFailed } from '../../services/report.service';
import { logger } from '../../utils/logger';

export const reportWorker = new Worker(
  'reports',
  async (job) => {
    const { reportId, userId, type } = job.data as {
      reportId: string;
      userId: string;
      type: string;
    };

    logger.info(`Processing report ${reportId} (type: ${type})`);

    // Build report data
    const data = await buildReportData(userId, type);

    // Store data in report
    await Report.findByIdAndUpdate(reportId, { data });

    // Generate PDF
    const pdfPath = await generatePDF(reportId);

    // Mark complete
    await Report.findByIdAndUpdate(reportId, {
      status: 'completed',
      pdfPath,
    });

    logger.info(`Report ${reportId} generated at ${pdfPath}`);
    return { reportId, pdfPath };
  },
  {
    connection: redis as any,
    concurrency: 2,
  }
);

reportWorker.on('failed', async (job, err) => {
  if (job) {
    const { reportId } = job.data as { reportId: string };
    await markReportFailed(reportId, err.message);
  }
});
