import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import {
  githubLogin,
  githubCallback,
  getMe,
  logout,
  loginWithUsername,
  linkedinLogin,
  linkedinCallback,
} from '../controllers/auth.controller';

const router = Router();

router.get('/github', authLimiter, asyncHandler(githubLogin));
router.get('/github/callback', authLimiter, asyncHandler(githubCallback));
router.post('/username-login', asyncHandler(loginWithUsername));
router.get('/me', requireAuth, asyncHandler(getMe));
router.post('/logout', requireAuth, asyncHandler(logout));

router.get('/linkedin', requireAuth, asyncHandler(linkedinLogin));
router.get('/linkedin/callback', asyncHandler(linkedinCallback));

export default router;
