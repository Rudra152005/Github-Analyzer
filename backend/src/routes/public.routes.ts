import { Router } from 'express';
import { getGlobalStats, subscribeNewsletter } from '../controllers/public.controller';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for newsletter to prevent spam
const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: 'Too many subscription requests from this IP, please try again after 15 minutes' }
});

router.get('/stats', getGlobalStats);
router.post('/subscribe', newsletterLimiter, subscribeNewsletter);

export default router;
