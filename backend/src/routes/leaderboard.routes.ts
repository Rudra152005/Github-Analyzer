import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  getLeaderboardHandler,
  getUserProfile,
} from '../controllers/leaderboard.controller';

const router = Router();

router.get('/', asyncHandler(getLeaderboardHandler));

export default router;

// Also used for /api/users/:username/profile
export const usersRouter = Router();
usersRouter.get('/:username/profile', asyncHandler(getUserProfile));
