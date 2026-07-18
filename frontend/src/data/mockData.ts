import { Repository, UserProfile, ActivityData, LanguageStats, InsightData, LeaderboardEntry, Report, CareerAnalysis } from '../types';

export const mockUser: UserProfile = {
  id: '1',
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
  createdAt: '2019-03-15',
  contributions: 2847,
  streak: 127,
};

export const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'react-dashboard',
    fullName: 'alexjohnson/react-dashboard',
    description: 'A modern, responsive dashboard built with React and TypeScript. Features real-time data visualization.',
    language: 'TypeScript',
    stars: 1247,
    forks: 312,
    issues: 24,
    healthScore: 94,
    lastUpdated: '2024-01-15',
    isPrivate: false,
    url: 'https://github.com/alexjohnson/react-dashboard',
    topics: ['react', 'dashboard', 'typescript', 'visualization'],
    contributors: 23,
    commits: 847,
    branches: 5,
  },
  {
    id: '2',
    name: 'node-api-starter',
    fullName: 'alexjohnson/node-api-starter',
    description: 'Production-ready Node.js API boilerplate with authentication, rate limiting, and Docker support.',
    language: 'JavaScript',
    stars: 892,
    forks: 156,
    issues: 8,
    healthScore: 98,
    lastUpdated: '2024-01-12',
    isPrivate: false,
    url: 'https://github.com/alexjohnson/node-api-starter',
    topics: ['nodejs', 'api', 'boilerplate', 'docker'],
    contributors: 12,
    commits: 423,
    branches: 3,
  },
  {
    id: '3',
    name: 'ml-pipeline-toolkit',
    fullName: 'alexjohnson/ml-pipeline-toolkit',
    description: 'Tools for building and deploying machine learning pipelines with automated testing and monitoring.',
    language: 'Python',
    stars: 567,
    forks: 89,
    issues: 15,
    healthScore: 87,
    lastUpdated: '2024-01-10',
    isPrivate: false,
    url: 'https://github.com/alexjohnson/ml-pipeline-toolkit',
    topics: ['python', 'machine-learning', 'pipeline', 'mlops'],
    contributors: 8,
    commits: 312,
    branches: 4,
  },
  {
    id: '4',
    name: 'cli-utils',
    fullName: 'alexjohnson/cli-utils',
    description: 'Collection of CLI utilities for developer productivity. Includes git hooks, code generators, and more.',
    language: 'Go',
    stars: 423,
    forks: 67,
    issues: 5,
    healthScore: 92,
    lastUpdated: '2024-01-08',
    isPrivate: false,
    url: 'https://github.com/alexjohnson/cli-utils',
    topics: ['go', 'cli', 'tools', 'devtools'],
    contributors: 6,
    commits: 234,
    branches: 2,
  },
  {
    id: '5',
    name: 'design-system',
    fullName: 'alexjohnson/design-system',
    description: 'Comprehensive design system with 50+ React components, Figma integration, and accessibility-first approach.',
    language: 'TypeScript',
    stars: 1056,
    forks: 198,
    issues: 31,
    healthScore: 89,
    lastUpdated: '2024-01-05',
    isPrivate: false,
    url: 'https://github.com/alexjohnson/design-system',
    topics: ['react', 'design-system', 'components', 'accessibility'],
    contributors: 34,
    commits: 1293,
    branches: 8,
  },
  {
    id: '6',
    name: 'graphql-server',
    fullName: 'alexjohnson/graphql-server',
    description: 'High-performance GraphQL server with subscriptions, federation support, and built-in caching.',
    language: 'TypeScript',
    stars: 734,
    forks: 134,
    issues: 18,
    healthScore: 91,
    lastUpdated: '2024-01-03',
    isPrivate: false,
    url: 'https://github.com/alexjohnson/graphql-server',
    topics: ['graphql', 'typescript', 'server', 'api'],
    contributors: 15,
    commits: 534,
    branches: 4,
  },
];

export const mockActivityData: ActivityData[] = Array.from({ length: 365 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (364 - i));
  return {
    date: date.toISOString().split('T')[0],
    count: Math.floor(Math.random() * 15),
  };
});

export const mockLanguageStats: LanguageStats[] = [
  { language: 'TypeScript', percentage: 42, color: '#3178c6', repos: 18 },
  { language: 'JavaScript', percentage: 21, color: '#f7df1e', repos: 10 },
  { language: 'Python', percentage: 15, color: '#3776ab', repos: 6 },
  { language: 'Go', percentage: 12, color: '#00add8', repos: 5 },
  { language: 'Rust', percentage: 6, color: '#dea584', repos: 2 },
  { language: 'Other', percentage: 4, color: '#8b949e', repos: 1 },
];

export const mockInsights: InsightData[] = [
  {
    title: 'Strong TypeScript Expertise',
    description: 'Your TypeScript projects show advanced patterns and excellent type safety practices.',
    type: 'strength',
    category: 'Technical Skills',
  },
  {
    title: 'Consistent Contribution Pattern',
    description: 'You maintain a steady contribution pattern with an impressive 127-day streak.',
    type: 'strength',
    category: 'Activity',
  },
  {
    title: 'API Design Skills',
    description: 'Your API projects demonstrate understanding of RESTful and GraphQL best practices.',
    type: 'strength',
    category: 'Technical Skills',
  },
  {
    title: 'Improve Documentation',
    description: 'Consider adding more comprehensive documentation to your repositories.',
    type: 'improvement',
    category: 'Best Practices',
  },
  {
    title: 'Increase Test Coverage',
    description: 'Some repositories have low test coverage. Adding tests would improve reliability.',
    type: 'improvement',
    category: 'Quality',
  },
  {
    title: 'Explore Mobile Development',
    description: 'Your skill set aligns well with mobile development. Consider learning React Native.',
    type: 'suggestion',
    category: 'Growth',
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'sarahcodes', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&crop=face', score: 98, repositories: 156, contributions: 4523, streak: 365 },
  { rank: 2, username: 'devmaster', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face', score: 96, repositories: 134, contributions: 4234, streak: 289 },
  { rank: 3, username: 'codewizard', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a5b4?w=48&h=48&fit=crop&crop=face', score: 94, repositories: 98, contributions: 3891, streak: 156 },
  { rank: 4, username: 'alexjohnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face', score: 92, repositories: 42, contributions: 2847, streak: 127 },
  { rank: 5, username: 'techguru', avatar: 'https://images.unsplash.com/photo-1479340095178-32e6d3a62e14?w=48&h=48&fit=crop&crop=face', score: 89, repositories: 87, contributions: 2567, streak: 98 },
  { rank: 6, username: 'bytebuilder', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c4727a?w=48&h=48&fit=crop&crop=face', score: 87, repositories: 67, contributions: 2345, streak: 87 },
  { rank: 7, username: 'stackmaster', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416aac83a?w=48&h=48&fit=crop&crop=face', score: 85, repositories: 54, contributions: 2134, streak: 76 },
  { rank: 8, username: 'devops_hero', avatar: 'https://images.unsplash.com/photo-1530268729831-4b0b9e535836?w=48&h=48&fit=crop&crop=face', score: 83, repositories: 45, contributions: 1987, streak: 65 },
];

export const mockReports: Report[] = [
  { id: '1', title: 'Q4 2023 Career Analysis', createdAt: '2024-01-01', type: 'Career Analysis', status: 'completed' },
  { id: '2', title: 'Repository Health Report', createdAt: '2023-12-15', type: 'Repository Report', status: 'completed' },
  { id: '3', title: 'Skills Assessment', createdAt: '2023-12-01', type: 'Skills Report', status: 'completed' },
];

export const mockCareerAnalysis: CareerAnalysis = {
  role: 'Full Stack Developer',
  score: 78,
  strengths: [
    'Strong TypeScript and JavaScript expertise',
    'Experience with both frontend and backend technologies',
    'Good understanding of API design patterns',
    'Active open-source contributor',
  ],
  weaknesses: [
    'Limited cloud deployment experience',
    'Missing experience with container orchestration',
    'No demonstrated experience with system design at scale',
  ],
  missingSkills: [
    'Kubernetes',
    'AWS/CloudFormation',
    'System Design',
    'Microservices Architecture',
    'CI/CD Pipeline Design',
  ],
  recommendedProjects: [
    'Build a microservices application with Kubernetes deployment',
    'Create a CI/CD pipeline with GitHub Actions and AWS',
    'Develop a real-time collaboration tool with WebSockets',
  ],
  recommendedCertifications: [
    'AWS Solutions Architect Associate',
    'Kubernetes Administrator (CKA)',
    'MongoDB Developer Certification',
  ],
  interviewReadiness: 72,
  resumeFeedback: 'Strong technical background with impressive open-source contributions. Highlight your architecture decisions and add metrics to demonstrate impact.',
  portfolioSuggestions: [
    'Add case studies for your top 3 projects',
    'Include architecture diagrams',
    'Showcase performance optimizations',
    'Add user testimonials or adoption metrics',
  ],
  learningRoadmap: [
    {
      title: 'Master Kubernetes Fundamentals',
      description: 'Learn container orchestration, deployments, services, and config maps',
      resources: ['Kubernetes Official Docs', 'KodeKloud K8s Course', 'CKAD Certification Course'],
      estimatedTime: '4-6 weeks',
      priority: 'high',
    },
    {
      title: 'AWS Cloud Practitioner',
      description: 'Understand core AWS services, pricing, and architecture best practices',
      resources: ['AWS Free Tier', 'AWS Certified Solutions Architect Study Guide', 'A Cloud Guru'],
      estimatedTime: '8-12 weeks',
      priority: 'high',
    },
    {
      title: 'System Design Fundamentals',
      description: 'Learn scalability, availability, and distributed systems concepts',
      resources: ['System Design Primer', 'Designing Data-Intensive Applications', 'System Design Interview'],
      estimatedTime: '6-8 weeks',
      priority: 'medium',
    },
  ],
};

export const weeklyContributions = [
  { week: 'Jan 1', commits: 34, prs: 5, issues: 8, reviews: 12 },
  { week: 'Jan 8', commits: 45, prs: 7, issues: 6, reviews: 15 },
  { week: 'Jan 15', commits: 38, prs: 4, issues: 9, reviews: 18 },
  { week: 'Jan 22', commits: 52, prs: 9, issues: 5, reviews: 22 },
  { week: 'Jan 29', commits: 41, prs: 6, issues: 7, reviews: 16 },
  { week: 'Feb 5', commits: 48, prs: 8, issues: 4, reviews: 19 },
  { week: 'Feb 12', commits: 55, prs: 11, issues: 3, reviews: 24 },
  { week: 'Feb 19', commits: 39, prs: 5, issues: 8, reviews: 14 },
];

export const skillRadar = [
  { skill: 'Frontend', value: 92 },
  { skill: 'Backend', value: 78 },
  { skill: 'DevOps', value: 54 },
  { skill: 'Database', value: 71 },
  { skill: 'Testing', value: 68 },
  { skill: 'Security', value: 45 },
  { skill: 'AI/ML', value: 38 },
  { skill: 'Cloud', value: 42 },
];

export const monthlyGrowth = [
  { month: 'Jul', stars: 1800, followers: 1100 },
  { month: 'Aug', stars: 1950, followers: 1145 },
  { month: 'Sep', stars: 2150, followers: 1178 },
  { month: 'Oct', stars: 2380, followers: 1198 },
  { month: 'Nov', stars: 2650, followers: 1223 },
  { month: 'Dec', stars: 2890, followers: 1247 },
];
