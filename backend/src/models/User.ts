import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  githubId: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  company: string;
  blog: string;
  twitter: string;
  followers: number;
  following: number;
  publicRepos: number;
  starred: number;
  createdAt: Date;
  contributions: number;
  streak: number;
  // Stored encrypted
  githubAccessToken?: string;
  // Settings
  notifications: {
    emailNotifications: boolean;
    weeklyReports: boolean;
    newInsights: boolean;
    careerReminders: boolean;
  };
  privacy: {
    publicProfile: boolean;
    showInLeaderboards: boolean;
    shareCareerAnalysis: boolean;
  };
  connectedAccounts: {
    github: boolean;
    linkedin: boolean;
    linkedinToken?: string;
    linkedinUrl?: string;
  };
  leaderboardScore: number;
  lastSyncedAt?: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    githubId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    company: { type: String, default: '' },
    blog: { type: String, default: '' },
    twitter: { type: String, default: '' },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    publicRepos: { type: Number, default: 0 },
    starred: { type: Number, default: 0 },
    contributions: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    githubAccessToken: { type: String, required: false },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
      newInsights: { type: Boolean, default: true },
      careerReminders: { type: Boolean, default: true },
    },
    privacy: {
      publicProfile: { type: Boolean, default: true },
      showInLeaderboards: { type: Boolean, default: true },
      shareCareerAnalysis: { type: Boolean, default: false },
    },
    connectedAccounts: {
      github: { type: Boolean, default: true },
      linkedin: { type: Boolean, default: false },
      linkedinToken: { type: String },
      linkedinUrl: { type: String, default: '' },
    },
    leaderboardScore: { type: Number, default: 0, index: true },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
