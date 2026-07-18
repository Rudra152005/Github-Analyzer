import { Schema, model, Document } from 'mongoose';

export interface IRepository extends Document {
  userId: string;
  githubId: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  issues: number;
  healthScore: number;
  lastUpdated: string;
  isPrivate: boolean;
  url: string;
  topics: string[];
  contributors: number;
  commits: number;
  branches: number;
  cachedAt: Date;
  aiReview: string;
}

const RepositorySchema = new Schema<IRepository>(
  {
    userId: { type: String, required: true, index: true },
    githubId: { type: String, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    description: { type: String, default: '' },
    language: { type: String, default: '' },
    stars: { type: Number, default: 0, index: true },
    forks: { type: Number, default: 0 },
    issues: { type: Number, default: 0 },
    healthScore: { type: Number, default: 50, index: true },
    lastUpdated: { type: String, required: true, index: true },
    isPrivate: { type: Boolean, default: false },
    url: { type: String, required: true },
    topics: [{ type: String }],
    contributors: { type: Number, default: 1 },
    commits: { type: Number, default: 0 },
    branches: { type: Number, default: 1 },
    cachedAt: { type: Date, default: Date.now },
    aiReview: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound index for sorting
RepositorySchema.index({ userId: 1, stars: -1 });
RepositorySchema.index({ userId: 1, lastUpdated: -1 });
RepositorySchema.index({ userId: 1, healthScore: -1 });

export const Repository = model<IRepository>('Repository', RepositorySchema);
