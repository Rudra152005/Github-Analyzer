import { Request, Response } from 'express';
import fs from 'fs';
import { Report } from '../models/Report';
import { Job } from '../models/Job';
import { AppError } from '../middleware/errorHandler';
import { toReport } from '../utils/dto-mappers';
import { enqueueReportJob } from '../jobs/queues/reportQueue';
import { getReportPath } from '../services/report.service';

const REPORT_TYPES = [
  'Career Analysis',
  'Repository Health',
  'Skills Assessment',
  'Profile Overview',
];

export async function getReports(req: Request, res: Response): Promise<void> {
  const userId = req.session.userId!;
  const reports = await Report.find({ userId }).sort({ createdAt: -1 }).lean();
  res.json(reports.map((r) => toReport(r as Parameters<typeof toReport>[0])));
}

export async function generateReport(req: Request, res: Response): Promise<void> {
  const userId = req.session.userId!;
  const { type } = req.body as { type: string };

  if (!REPORT_TYPES.includes(type)) {
    throw new AppError(`Invalid report type. Must be one of: ${REPORT_TYPES.join(', ')}`, 400);
  }

  const title = `${type} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const report = await Report.create({ userId, title, type, status: 'processing' });

  // Enqueue generation
  await enqueueReportJob(String(report._id), userId, type);

  res.status(202).json({ reportId: String(report._id), status: 'processing' });
}

export async function getReportById(req: Request, res: Response): Promise<void> {
  const { reportId } = req.params;
  const report = await Report.findById(reportId).lean();
  if (!report) throw new AppError('Report not found', 404);
  if (report.userId !== req.session.userId) throw new AppError('Unauthorized', 403);
  res.json(toReport(report as Parameters<typeof toReport>[0]));
}

export async function downloadReport(req: Request, res: Response): Promise<void> {
  const { reportId } = req.params;
  const report = await Report.findById(reportId).lean();
  if (!report) throw new AppError('Report not found', 404);
  if (report.userId !== req.session.userId) throw new AppError('Unauthorized', 403);
  if (report.status !== 'completed') throw new AppError('Report is not ready yet', 400);

  const filePath = getReportPath(reportId);
  if (!filePath) throw new AppError('Report file not found', 404);

  const { inline } = req.query as { inline?: string };
  const disposition = inline === 'true' ? 'inline' : `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', disposition);
  fs.createReadStream(filePath).pipe(res);
}

export async function deleteReport(req: Request, res: Response): Promise<void> {
  const { reportId } = req.params;
  const report = await Report.findById(reportId);
  if (!report) throw new AppError('Report not found', 404);
  if (report.userId !== req.session.userId) throw new AppError('Unauthorized', 403);

  const filePath = getReportPath(reportId);
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err: any) {
      // ignore
    }
  }

  await Report.findByIdAndDelete(reportId);
  res.json({ message: 'Report deleted successfully' });
}
