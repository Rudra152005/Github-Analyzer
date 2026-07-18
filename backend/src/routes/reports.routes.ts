import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';
import {
  getReports,
  generateReport,
  getReportById,
  downloadReport,
  deleteReport,
} from '../controllers/reports.controller';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(getReports));
router.post('/generate', asyncHandler(generateReport));
router.get('/:reportId', asyncHandler(getReportById));
router.get('/:reportId/download', asyncHandler(downloadReport));
router.delete('/:reportId', asyncHandler(deleteReport));

export default router;
