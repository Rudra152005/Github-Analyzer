import rateLimit from 'express-rate-limit';

/** General API rate limiter */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

/** AI endpoints — stricter limit */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit exceeded. Please wait before generating more insights.' },
  keyGenerator: (req) => req.session?.userId ?? req.ip ?? 'unknown',
});

/** Auth endpoints */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
