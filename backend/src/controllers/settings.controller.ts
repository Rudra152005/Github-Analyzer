import { Request, Response } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { toUserProfile } from '../utils/dto-mappers';

export async function getSettings(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.session.userId).lean();
  if (!user) throw new AppError('User not found', 404);
  res.json({
    profile: toUserProfile(user as Parameters<typeof toUserProfile>[0]),
    notifications: user.notifications,
    privacy: user.privacy,
    connectedAccounts: user.connectedAccounts,
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { name, bio, location, company, blog, twitter } = req.body as {
    name?: string;
    bio?: string;
    location?: string;
    company?: string;
    blog?: string;
    twitter?: string;
  };

  const user = await User.findByIdAndUpdate(
    req.session.userId,
    { $set: { name, bio, location, company, blog, twitter } },
    { new: true }
  );
  if (!user) throw new AppError('User not found', 404);
  res.json(toUserProfile(user));
}

export async function updateNotifications(req: Request, res: Response): Promise<void> {
  const user = await User.findByIdAndUpdate(
    req.session.userId,
    { $set: { notifications: req.body } },
    { new: true }
  ).lean();
  if (!user) throw new AppError('User not found', 404);
  res.json(user.notifications);
}

export async function updatePrivacy(req: Request, res: Response): Promise<void> {
  const user = await User.findByIdAndUpdate(
    req.session.userId,
    { $set: { privacy: req.body } },
    { new: true }
  ).lean();
  if (!user) throw new AppError('User not found', 404);
  res.json(user.privacy);
}

export async function connectLinkedIn(req: Request, res: Response): Promise<void> {
  const { linkedinUrl } = req.body as { linkedinUrl: string };

  if (!linkedinUrl || !linkedinUrl.includes('linkedin.com/')) {
    throw new AppError('Invalid LinkedIn URL. Must contain linkedin.com', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.session.userId,
    {
      $set: {
        'connectedAccounts.linkedin': true,
        'connectedAccounts.linkedinUrl': linkedinUrl,
      },
    },
    { new: true }
  ).lean();

  if (!user) throw new AppError('User not found', 404);
  res.json(user.connectedAccounts);
}

export async function disconnectLinkedIn(req: Request, res: Response): Promise<void> {
  const user = await User.findByIdAndUpdate(
    req.session.userId,
    {
      $set: {
        'connectedAccounts.linkedin': false,
        'connectedAccounts.linkedinUrl': '',
      },
    },
    { new: true }
  ).lean();

  if (!user) throw new AppError('User not found', 404);
  res.json(user.connectedAccounts);
}
