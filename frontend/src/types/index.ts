export interface Repository {
  id: string;
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
  complexityScore: number;
  marketRelevance: number;
  aiReview?: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    valueAssessment: string;
  } | null;
}

export interface UserProfile {
  id: string;
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
  createdAt: string;
  contributions: number;
  streak: number;
}

export interface CareerAnalysis {
  role: string;
  score: number;
  strengths: string[];
  weaknesses: string[];              // maps to areasToImprove from Claude
  missingSkills: string[];
  recommendedProjects: string[];
  recommendedCertifications: string[];
  interviewReadiness: number;
  resumeFeedback: string;
  portfolioSuggestions: string[];
  roleMatch: string;                 // e.g. "Strong match" | "Partial match" | "Low match"
  learningRoadmap: LearningStep[];
}

export interface LearningStep {
  title: string;
  description: string;
  resources: string[];
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ActivityData {
  date: string;
  count: number;
}

export interface LanguageStats {
  language: string;
  percentage: number;
  color: string;
  repos: number;
}

export interface InsightData {
  title: string;
  description: string;
  type: 'strength' | 'improvement' | 'suggestion';
  category: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  repositories: number;
  contributions: number;
  streak: number;
  followers: number;
}

export interface Report {
  id: string;
  title: string;
  createdAt: string;
  type: string;
  status: 'completed' | 'processing' | 'failed';
}

export type JobRole =
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'AI Engineer'
  | 'ML Engineer'
  | 'DevOps Engineer'
  | 'Cloud Engineer'
  | 'Cybersecurity Engineer'
  | 'Data Scientist'
  | 'Mobile Developer';

export interface ComparisonResult {
  user1: UserProfile;
  user2: UserProfile;
  stats1: Record<string, number>;
  stats2: Record<string, number>;
  winner: 'user1' | 'user2' | 'tie';
  analysis: string;
}
