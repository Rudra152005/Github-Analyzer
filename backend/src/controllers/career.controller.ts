import { Request, Response } from 'express';
import { User } from '../models/User';
import { decrypt } from '../utils/encryption';
import { analyzeCareerForUser } from '../services/claude.career.service';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const VALID_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'AI Engineer',
  'ML Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Cybersecurity Engineer',
  'Data Scientist',
  'Mobile Developer',
];

export async function analyzeCareerHandler(req: Request, res: Response): Promise<void> {
  const userId = req.session.userId!;
  // Accept role from body (POST) or query string (GET)
  const role: string = (req.body?.role ?? req.query?.role ?? 'Full Stack Developer') as string;

  if (!VALID_ROLES.includes(role)) {
    throw new AppError(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 400);
  }

  const user = await User.findById(userId).lean();
  if (!user) throw new AppError('User not found', 404);

  // Decrypt the stored GitHub access token so we can hit the GitHub API
  let githubToken: string | undefined;
  try {
    if (user.githubAccessToken) {
      githubToken = decrypt(user.githubAccessToken);
    }
  } catch {
    logger.warn(`Could not decrypt GitHub token for user ${user.username} — will use unauthenticated GitHub API`);
  }

  logger.info(`Career analysis requested for ${user.username} → ${role}`);

  const analysis = await analyzeCareerForUser(user.username, role, githubToken);

  res.json(analysis);
}
