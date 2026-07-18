import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';
import {
  getProfile,
  getRepos,
  getActivity,
  getLanguages,
  getGrowth,
  getAnalyticsSummary,
  getAnalyticsWeekly,
  getAnalyticsSkills,
  getAnalyticsGrowth,
} from '../controllers/user.controller';
import { getSettings, updateProfile, updateNotifications, updatePrivacy, connectLinkedIn, disconnectLinkedIn } from '../controllers/settings.controller';
import { getInsights, regenerateInsights } from '../controllers/insights.controller';
import { analyzeCareerHandler } from '../controllers/career.controller';
import { aiLimiter } from '../middleware/rateLimit';

const router = Router();

// All routes require auth
router.use(requireAuth);

// Profile
router.get('/me', asyncHandler(getProfile));
router.get('/me/repos', asyncHandler(getRepos));
router.get('/me/activity', asyncHandler(getActivity));
router.get('/me/languages', asyncHandler(getLanguages));
router.get('/me/growth', asyncHandler(getGrowth));

// Analytics
router.get('/me/analytics/summary', asyncHandler(getAnalyticsSummary));
router.get('/me/analytics/weekly', asyncHandler(getAnalyticsWeekly));
router.get('/me/analytics/skills', aiLimiter, asyncHandler(getAnalyticsSkills));
router.get('/me/analytics/growth', asyncHandler(getAnalyticsGrowth));

// Insights
router.get('/me/insights', aiLimiter, asyncHandler(getInsights));
router.post('/me/insights/regenerate', aiLimiter, asyncHandler(regenerateInsights));

// Career
router.post('/me/career/analyze', aiLimiter, asyncHandler(analyzeCareerHandler));
router.get('/me/career/analyze', aiLimiter, asyncHandler(analyzeCareerHandler));

// Settings
router.get('/me/settings', asyncHandler(getSettings));
router.put('/me/settings/profile', asyncHandler(updateProfile));
router.put('/me/settings/notifications', asyncHandler(updateNotifications));
router.put('/me/settings/privacy', asyncHandler(updatePrivacy));
router.put('/me/settings/linkedin', asyncHandler(connectLinkedIn));
router.delete('/me/settings/linkedin', asyncHandler(disconnectLinkedIn));

export default router;
