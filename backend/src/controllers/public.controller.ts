import { Request, Response } from 'express';
import { User } from '../models/User';
import { Repository } from '../models/Repository';
import { Subscriber } from '../models/Subscriber';
import { logger } from '../utils/logger';

export const getGlobalStats = async (req: Request, res: Response) => {
  try {
    const userCount = await User.countDocuments();
    const repoCount = await Repository.countDocuments();
    
    // We can add some baseline numbers for the marketing page if the DB is new
    const baseUsers = 1500;
    const baseRepos = 10000;

    res.json({
      developers: userCount + baseUsers,
      reposAnalyzed: repoCount + baseRepos,
      satisfaction: 98 // Hardcoded satisfaction metric for marketing
    });
  } catch (error) {
    logger.error('Error fetching global stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      return res.status(409).json({ message: 'You are already subscribed!' });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res.status(201).json({ message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    logger.error('Error subscribing to newsletter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
