/**
 * Seed script — populates MongoDB with data mirroring
 * the frontend's src/data/mockData.ts so the frontend
 * can be pointed at real endpoints for a smoke test.
 *
 * Usage: npm run seed
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from './src/config/env';
import { User } from './src/models/User';
import { Repository } from './src/models/Repository';
import { CareerAnalysis } from './src/models/CareerAnalysis';
import { Report } from './src/models/Report';
import { encrypt } from './src/utils/encryption';

const MOCK_TOKEN = encrypt('mock_github_token_for_seeding');

const mockUser = {
  githubId: '1000001',
  username: 'alexjohnson',
  name: 'Alex Johnson',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  bio: 'Full-stack developer passionate about building elegant solutions. Open source enthusiast.',
  location: 'San Francisco, CA',
  company: 'TechCorp',
  blog: 'https://alexjohnson.dev',
  twitter: 'alexjohnson',
  followers: 1247,
  following: 89,
  publicRepos: 42,
  contributions: 2847,
  streak: 127,
  githubAccessToken: MOCK_TOKEN,
  leaderboardScore: 92,
};

const mockRepos = [
  { githubId: 'r1', name: 'react-dashboard', fullName: 'alexjohnson/react-dashboard', description: 'A modern, responsive dashboard built with React and TypeScript.', language: 'TypeScript', stars: 1247, forks: 312, issues: 24, healthScore: 94, lastUpdated: '2024-01-15', isPrivate: false, url: 'https://github.com/alexjohnson/react-dashboard', topics: ['react', 'dashboard', 'typescript', 'visualization'], contributors: 23, commits: 847, branches: 5 },
  { githubId: 'r2', name: 'node-api-starter', fullName: 'alexjohnson/node-api-starter', description: 'Production-ready Node.js API boilerplate with authentication, rate limiting, and Docker support.', language: 'JavaScript', stars: 892, forks: 156, issues: 8, healthScore: 98, lastUpdated: '2024-01-12', isPrivate: false, url: 'https://github.com/alexjohnson/node-api-starter', topics: ['nodejs', 'api', 'boilerplate', 'docker'], contributors: 12, commits: 423, branches: 3 },
  { githubId: 'r3', name: 'ml-pipeline-toolkit', fullName: 'alexjohnson/ml-pipeline-toolkit', description: 'Tools for building and deploying machine learning pipelines.', language: 'Python', stars: 567, forks: 89, issues: 15, healthScore: 87, lastUpdated: '2024-01-10', isPrivate: false, url: 'https://github.com/alexjohnson/ml-pipeline-toolkit', topics: ['python', 'machine-learning', 'pipeline', 'mlops'], contributors: 8, commits: 312, branches: 4 },
  { githubId: 'r4', name: 'cli-utils', fullName: 'alexjohnson/cli-utils', description: 'Collection of CLI utilities for developer productivity.', language: 'Go', stars: 423, forks: 67, issues: 5, healthScore: 92, lastUpdated: '2024-01-08', isPrivate: false, url: 'https://github.com/alexjohnson/cli-utils', topics: ['go', 'cli', 'tools', 'devtools'], contributors: 6, commits: 234, branches: 2 },
  { githubId: 'r5', name: 'design-system', fullName: 'alexjohnson/design-system', description: 'Comprehensive design system with 50+ React components.', language: 'TypeScript', stars: 1056, forks: 198, issues: 31, healthScore: 89, lastUpdated: '2024-01-05', isPrivate: false, url: 'https://github.com/alexjohnson/design-system', topics: ['react', 'design-system', 'components', 'accessibility'], contributors: 34, commits: 1293, branches: 8 },
  { githubId: 'r6', name: 'graphql-server', fullName: 'alexjohnson/graphql-server', description: 'High-performance GraphQL server with subscriptions and federation support.', language: 'TypeScript', stars: 734, forks: 134, issues: 18, healthScore: 91, lastUpdated: '2024-01-03', isPrivate: false, url: 'https://github.com/alexjohnson/graphql-server', topics: ['graphql', 'typescript', 'server', 'api'], contributors: 15, commits: 534, branches: 4 },
];

const leaderboardUsers = [
  { githubId: '2000001', username: 'sarahcodes', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&crop=face', followers: 2890, following: 120, publicRepos: 156, contributions: 4523, streak: 365, leaderboardScore: 98, githubAccessToken: MOCK_TOKEN, bio: '', location: '', company: '', blog: '', twitter: '' },
  { githubId: '2000002', username: 'devmaster', name: 'Dev Master', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face', followers: 2100, following: 95, publicRepos: 134, contributions: 4234, streak: 289, leaderboardScore: 96, githubAccessToken: MOCK_TOKEN, bio: '', location: '', company: '', blog: '', twitter: '' },
  { githubId: '2000003', username: 'codewizard', name: 'Code Wizard', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a5b4?w=48&h=48&fit=crop&crop=face', followers: 1800, following: 80, publicRepos: 98, contributions: 3891, streak: 156, leaderboardScore: 94, githubAccessToken: MOCK_TOKEN, bio: '', location: '', company: '', blog: '', twitter: '' },
];

async function seed() {
  await mongoose.connect(env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing seed data
  await User.deleteMany({ githubId: { $in: [mockUser.githubId, ...leaderboardUsers.map(u => u.githubId)] } });
  await Repository.deleteMany({ githubId: { $in: mockRepos.map(r => r.githubId) } });

  // Insert main user
  const user = await User.create({
    ...mockUser,
    notifications: { emailNotifications: true, weeklyReports: true, newInsights: true, careerReminders: true },
    privacy: { publicProfile: true, showInLeaderboards: true, shareCareerAnalysis: false },
    connectedAccounts: { github: true, linkedin: false },
  });
  console.log(`✅ Created user: ${user.username} (${user._id})`);

  // Insert repos linked to user
  for (const repo of mockRepos) {
    await Repository.create({ userId: String(user._id), ...repo });
  }
  console.log(`✅ Created ${mockRepos.length} repositories`);

  // Insert leaderboard users
  for (const lu of leaderboardUsers) {
    await User.findOneAndUpdate(
      { githubId: lu.githubId },
      { ...lu, notifications: { emailNotifications: false, weeklyReports: false, newInsights: false, careerReminders: false }, privacy: { publicProfile: true, showInLeaderboards: true, shareCareerAnalysis: false }, connectedAccounts: { github: true, linkedin: false } },
      { upsert: true }
    );
  }
  console.log(`✅ Created ${leaderboardUsers.length} leaderboard users`);

  // Seed a completed report
  await Report.create({
    userId: String(user._id),
    title: 'Q4 2023 Career Analysis',
    type: 'Career Analysis',
    status: 'completed',
    createdAt: new Date('2024-01-01'),
  });
  await Report.create({
    userId: String(user._id),
    title: 'Repository Health Report',
    type: 'Repository Health',
    status: 'completed',
    createdAt: new Date('2023-12-15'),
  });
  console.log('✅ Created sample reports');

  console.log('\n🌱 Seed complete!');
  console.log(`📋 Test user ID: ${user._id}`);
  console.log('📋 Copy this ID to test authenticated endpoints via session.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
