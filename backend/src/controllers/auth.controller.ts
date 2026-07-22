import { Request, Response } from 'express';
import axios from 'axios';
import { env } from '../config/env';
import { User } from '../models/User';
import { encrypt, decrypt } from '../utils/encryption';
import { fetchGitHubProfile } from '../services/github.service';
import { toUserProfile } from '../utils/dto-mappers';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────

export async function githubLogin(req: Request, res: Response): Promise<void> {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_CALLBACK_URL,
    scope: 'read:user user:email repo',
    state: Math.random().toString(36).slice(2),
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}

export async function githubCallback(req: Request, res: Response): Promise<void> {
  const { code } = req.query;
  if (!code) throw new AppError('Missing OAuth code', 400);

  // Exchange code for token
  const tokenRes = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_CALLBACK_URL,
    },
    { headers: { Accept: 'application/json' } }
  );

  const accessToken: string = tokenRes.data.access_token;
  if (!accessToken) {
    logger.error('GitHub OAuth error:', tokenRes.data);
    throw new AppError('Failed to obtain GitHub access token', 502);
  }

  // Fetch authenticated GitHub user's profile
  const { data: ghUser } = await axios.get('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' },
  });
  const profile = await fetchGitHubProfile(accessToken, ghUser.login);

  // Upsert user
  const encryptedToken = encrypt(accessToken);
  let user = await User.findOne({
    $or: [
      { githubId: profile.githubId },
      { username: new RegExp(`^${ghUser.login}$`, 'i') }
    ]
  });

  if (user) {
    user.set({
      ...profile,
      githubAccessToken: encryptedToken,
      lastSyncedAt: new Date(),
    });
    await user.save();
  } else {
    user = await User.create({
      ...profile,
      githubAccessToken: encryptedToken,
      lastSyncedAt: new Date(),
    });
  }

  // Set session
  req.session.userId = String(user._id);
  req.session.githubUsername = user.username;

  res.redirect(`${env.FRONTEND_URL}/dashboard`);
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.session.userId);
  if (!user) throw new AppError('User not found', 404);

  // Sync if contributions are 0 or unsynced
  if (user.githubAccessToken && (!user.contributions || user.contributions === 0)) {
    try {
      const token = decrypt(user.githubAccessToken);
      const fresh = await fetchGitHubProfile(token, user.username);
      Object.assign(user, fresh);
      user.lastSyncedAt = new Date();
      await user.save();
    } catch (err: any) {
      logger.warn(`Failed to auto-sync profile in getMe: ${err.message}`);
    }
  }

  res.json(toUserProfile(user));
}

export async function logout(req: Request, res: Response): Promise<void> {
  req.session.destroy((err) => {
    if (err) logger.error('Session destroy error:', err);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
}

export async function loginWithUsername(req: Request, res: Response): Promise<void> {
  const { username } = req.body;
  if (!username) {
    throw new AppError('Username is required', 400);
  }

  const cleanUsername = username.replace(/^@/, '').trim();

  try {
    let profile;
    try {
      profile = await fetchGitHubProfile('', cleanUsername);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        throw new AppError('GitHub user not found', 404);
      }
      throw err;
    }

    let user = await User.findOne({
      $or: [
        { githubId: profile.githubId },
        { username: new RegExp(`^${cleanUsername}$`, 'i') }
      ]
    });

    if (user) {
      user.set({
        ...profile,
        lastSyncedAt: new Date(),
      });
      await user.save();
    } else {
      user = await User.create({
        ...profile,
        lastSyncedAt: new Date(),
      });
    }

    req.session.userId = String(user._id);
    req.session.githubUsername = user.username;
    
    req.session.save((err) => {
      if (err) logger.error('Session save error:', err);
      res.json(toUserProfile(user));
    });
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    throw new AppError('Failed to fetch user data: ' + err.message, 500);
  }
}

export async function linkedinLogin(req: Request, res: Response): Promise<void> {
  res.redirect(`/api/auth/linkedin/callback?code=mock_linkedin_code_123`);
}

export async function linkedinCallback(req: Request, res: Response): Promise<void> {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect(`${env.FRONTEND_URL}/login`);
    return;
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  user.connectedAccounts = {
    ...user.connectedAccounts,
    linkedin: true,
    linkedinToken: 'mock_linkedin_access_token_abc123',
  };
  await user.save();

  res.redirect(`${env.FRONTEND_URL}/settings?linkedin=success`);
}

