import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { compareHandler, getPublicProfile } from '../controllers/compare.controller';
import { aiLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/', requireAuth, aiLimiter, asyncHandler(compareHandler));

// Also expose /api/github/user/:username
export const githubRouter = Router();
githubRouter.get('/user/:username', asyncHandler(getPublicProfile));

export default router;
