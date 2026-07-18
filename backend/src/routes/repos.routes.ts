import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimit';
import { getAIReview } from '../controllers/repos.controller';
import { getJob } from '../controllers/insights.controller';

const router = Router();

router.use(requireAuth);
router.post('/:repoId/ai-review', aiLimiter, asyncHandler(getAIReview));

export { router as reposRouter };

// Also export job polling (mounted at /api/jobs)
const jobRouter = Router();
jobRouter.use(requireAuth);
jobRouter.get('/:jobId', asyncHandler(getJob));

export { jobRouter };
