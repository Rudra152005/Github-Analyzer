import { IUser } from '../models/User';
import { IRepository } from '../models/Repository';
import { ICareerAnalysis } from '../models/CareerAnalysis';
import { IReport } from '../models/Report';

export function toUserProfile(user: IUser | Record<string, any>) {
  return {
    id: String((user as any)._id),
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    company: user.company,
    blog: user.blog,
    twitter: user.twitter,
    followers: user.followers,
    following: user.following,
    publicRepos: user.publicRepos,
    createdAt: user.createdAt?.toISOString?.() ?? '',
    contributions: user.contributions,
    streak: user.streak,
  };
}

export function toRepository(repo: IRepository | Record<string, any>) {
  const commits = repo.commits ?? 0;
  const branches = repo.branches ?? 1;
  const issues = repo.issues ?? 0;
  const stars = repo.stars ?? 0;

  // 1. Calculate Code Complexity Score (0-100) dynamically & stably
  const name = repo.name ?? '';
  const nameHash = name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 20;

  const langComplexity: Record<string, number> = {
    'C++': 35,
    Rust: 35,
    Go: 25,
    TypeScript: 22,
    JavaScript: 18,
    Python: 20,
    Java: 28,
  };
  const langBase = langComplexity[repo.language] ?? 15;
  const popularityWeight = Math.min(20, Math.round(Math.log10(stars + (repo.forks ?? 0) + 1) * 6));
  const issuesWeight = Math.min(15, (repo.issues ?? 0) * 3);
  const descLength = repo.description?.length ?? 0;
  const descWeight = Math.min(10, Math.round(descLength / 8));

  const complexityScore = Math.min(
    98,
    Math.max(25, 20 + langBase + nameHash + popularityWeight + issuesWeight + descWeight)
  );

  // 2. Calculate Market Relevance / Fit Score (0-100)
  const marketHash = name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 10;
  const langMarket: Record<string, number> = {
    TypeScript: 38,
    JavaScript: 34,
    Python: 38,
    Rust: 35,
    Go: 35,
    'C++': 25,
  };
  const langMarketBase = langMarket[repo.language] ?? 20;

  let keywordBoost = 0;
  const lowerName = name.toLowerCase();
  const lowerDesc = (repo.description ?? '').toLowerCase();

  if (lowerName.includes('dsa') || lowerName.includes('algo') || lowerName.includes('structure') || lowerDesc.includes('dsa') || lowerDesc.includes('algo')) {
    keywordBoost += 18;
  }
  if (lowerName.includes('prep') || lowerName.includes('interview') || lowerDesc.includes('prep')) {
    keywordBoost += 12;
  }
  if (lowerName.includes('game') || lowerName.includes('splendor') || lowerName.includes('chess') || lowerDesc.includes('game')) {
    keywordBoost += 15;
  }
  if (lowerName.includes('git') || lowerName.includes('code') || lowerDesc.includes('git') || lowerDesc.includes('code')) {
    keywordBoost += 10;
  }
  if (lowerName.includes('api') || lowerName.includes('server') || lowerDesc.includes('api')) {
    keywordBoost += 12;
  }
  if (lowerName.includes('react') || lowerName.includes('ui') || lowerDesc.includes('ui') || lowerDesc.includes('react')) {
    keywordBoost += 12;
  }

  const marketKeywords = [
    'react', 'typescript', 'nextjs', 'nodejs', 'python', 'machine-learning', 'ml', 'ai',
    'llm', 'rust', 'go', 'graphql', 'docker', 'kubernetes', 'aws', 'cloud', 'design-system'
  ];
  const topics = repo.topics ?? [];
  const matched = topics.filter((t: string) => marketKeywords.includes(t.toLowerCase()));
  const topicsBoost = matched.length * 15;

  const marketRelevance = Math.min(
    99,
    Math.max(30, 20 + langMarketBase + marketHash + keywordBoost + topicsBoost + (stars > 500 ? 15 : stars > 100 ? 8 : 0))
  );

  return {
    id: (repo as any)._id ? String((repo as any)._id) : (repo.id || ''),
    name: repo.name,
    fullName: repo.fullName,
    description: repo.description,
    language: repo.language,
    stars: repo.stars,
    forks: repo.forks,
    issues: repo.issues,
    healthScore: repo.healthScore,
    lastUpdated: repo.lastUpdated,
    isPrivate: repo.isPrivate,
    url: repo.url,
    topics: repo.topics,
    contributors: repo.contributors,
    commits: repo.commits,
    branches: repo.branches,
    complexityScore,
    marketRelevance,
    aiReview: (() => {
      if (!repo.aiReview) return null;
      try {
        return JSON.parse(repo.aiReview);
      } catch {
        return null;
      }
    })(),
  };
}

export function toCareerAnalysis(doc: ICareerAnalysis) {
  return {
    role: doc.role,
    score: doc.score,
    strengths: doc.strengths,
    weaknesses: doc.weaknesses,
    missingSkills: doc.missingSkills,
    recommendedProjects: doc.recommendedProjects,
    recommendedCertifications: doc.recommendedCertifications,
    interviewReadiness: doc.interviewReadiness,
    resumeFeedback: doc.resumeFeedback,
    portfolioSuggestions: doc.portfolioSuggestions,
    learningRoadmap: doc.learningRoadmap,
  };
}

export function toReport(doc: IReport | Record<string, any>) {
  return {
    id: String((doc as any)._id),
    title: doc.title,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString().split('T')[0] : String(doc.createdAt ?? '').split('T')[0],
    type: doc.type,
    status: doc.status,
  };
}
