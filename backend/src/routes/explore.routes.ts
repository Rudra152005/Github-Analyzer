import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  getTrendingRepos,
  getTrendingTopicsHandler,
  getTopUsersHandler,
  searchHandler,
} from '../controllers/explore.controller';

const router = Router();

router.get('/trending-repos', asyncHandler(getTrendingRepos));
router.get('/trending-topics', asyncHandler(getTrendingTopicsHandler));
router.get('/top-users', asyncHandler(getTopUsersHandler));
router.get('/search', asyncHandler(searchHandler));

export default router;
