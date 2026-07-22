import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Search,
  TrendingUp,
  Star,
  Users,
  Flame,
  Sparkles,
  Filter,
  Tag,
  Clock,
  ArrowUpRight,
  GitFork,
  AlertCircle,
  X,
  Activity,
  Award,
  ChevronRight,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../ui';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type TabType = 'trending' | 'ai-picks' | 'topics' | 'developers' | 'hidden-gems';

interface RepoItem {
  id: string;
  name: string;
  owner: string;
  ownerAvatar: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  lastUpdated: string;
  topics: string[];
  aiSummary: string;
  healthScore: number;
  license?: string;
  isGoodFirstIssue?: boolean;
  isBeginnerFriendly?: boolean;
}

interface AIPickItem {
  id: string;
  name: string;
  owner: string;
  ownerAvatar: string;
  description: string;
  whyRecommended: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  bestFor: 'Learning' | 'Contribution' | 'Production';
  estimatedTime: string;
  technologies: string[];
  stars: number;
  language: string;
}

interface TopicItem {
  id: string;
  name: string;
  category: string;
  repoCount: string;
  growth: string;
  iconName: string;
  description: string;
  color: string;
}

interface DeveloperItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  publicRepos: number;
  totalStars: number;
  topRepo: string;
  heatScore: number;
  isFollowing?: boolean;
}

interface HiddenGemItem {
  id: string;
  name: string;
  owner: string;
  ownerAvatar: string;
  description: string;
  stars: number;
  codeQualityScore: number;
  docsQualityScore: number;
  activityLevel: 'Very High' | 'High' | 'Moderate';
  aiRecommendation: string;
  language: string;
}

interface TechTrend {
  name: string;
  growth: string;
  popularityScore: number;
  sparkline: number[];
  category: string;
}

// ─── LANGUAGE COLORS ─────────────────────────────────────────────────────────

const LANGUAGE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  TypeScript: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
  JavaScript: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  Python: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  Go: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  Rust: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' },
  'C++': { bg: 'bg-pink-500/10', text: 'text-pink-400', dot: 'bg-pink-500' },
  Java: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
};

// ─── CIRCULAR HEALTH SCORE INDICATOR ─────────────────────────────────────────

function CircularHealthScore({ score, size = 48 }: { score: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return '#10B981'; // Green
    if (s >= 70) return '#06B6D4'; // Cyan
    if (s >= 50) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-light-border dark:text-dark-border opacity-30"
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-text-primary dark:text-white">
        {score}
      </span>
    </div>
  );
}

// ─── MINI SPARKLINE CHART ───────────────────────────────────────────────────

function MiniSparkline({ data, color = '#10B981' }: { data: number[]; color?: string }) {
  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 60;
      const y = 20 - ((val - min) / (max - min || 1)) * 16;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width="60" height="24" className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────

const SAMPLE_TRENDING_REPOS: RepoItem[] = [
  {
    id: '1',
    name: 'ragflow',
    owner: 'infiniflow',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/105741634?v=4',
    description: 'An open-source RAG (Retrieval-Augmented Generation) engine based on deep document understanding.',
    language: 'Python',
    stars: 28450,
    forks: 3120,
    openIssues: 142,
    lastUpdated: '2 hours ago',
    topics: ['rag', 'llm', 'ai', 'search', 'python'],
    aiSummary: 'High performance engine for enterprise RAG workflows with multi-modal document parser.',
    healthScore: 94,
    license: 'Apache-2.0',
    isGoodFirstIssue: true,
    isBeginnerFriendly: true,
  },
  {
    id: '2',
    name: 'shadcn-ui',
    owner: 'shadcn',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/124599?v=4',
    description: 'Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.',
    language: 'TypeScript',
    stars: 67200,
    forks: 4890,
    openIssues: 85,
    lastUpdated: '1 hour ago',
    topics: ['react', 'tailwind', 'typescript', 'components', 'ui'],
    aiSummary: 'Leading UI component pattern architecture built on Radix Primitives and Tailwind CSS.',
    healthScore: 98,
    license: 'MIT',
    isGoodFirstIssue: true,
    isBeginnerFriendly: true,
  },
  {
    id: '3',
    name: 'ollama',
    owner: 'ollama',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/142998054?v=4',
    description: 'Get up and running with Llama 3.3, Phi 3, Mistral, Gemma 2, and other large language models locally.',
    language: 'Go',
    stars: 94800,
    forks: 7420,
    openIssues: 310,
    lastUpdated: '3 hours ago',
    topics: ['llm', 'ai', 'local-ai', 'go', 'gemma'],
    aiSummary: 'De facto standard runtime for hosting quantized LLMs locally across macOS, Linux, and Windows.',
    healthScore: 96,
    license: 'MIT',
    isGoodFirstIssue: false,
    isBeginnerFriendly: true,
  },
  {
    id: '4',
    name: 'agentic-ai-framework',
    owner: 'langchain-ai',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/126733545?v=4',
    description: 'Build resilient autonomous agents with stateful multi-actor orchestration.',
    language: 'Python',
    stars: 18900,
    forks: 2150,
    openIssues: 45,
    lastUpdated: '5 hours ago',
    topics: ['agents', 'ai-agents', 'langgraph', 'python'],
    aiSummary: 'Framework for multi-agent loops with Human-in-the-Loop decision gates and checkpointing.',
    healthScore: 91,
    license: 'MIT',
    isGoodFirstIssue: true,
    isBeginnerFriendly: false,
  },
  {
    id: '5',
    name: 'biome',
    owner: 'biomejs',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/144901844?v=4',
    description: 'One toolchain for your web project: fast formatter and linter for JS, TS, JSX, JSON, and CSS.',
    language: 'Rust',
    stars: 16400,
    forks: 580,
    openIssues: 92,
    lastUpdated: '4 hours ago',
    topics: ['linter', 'formatter', 'rust', 'typescript', 'toolchain'],
    aiSummary: 'Ultra-fast Rust-powered replacement for Prettier and ESLint with 10x-30x speedups.',
    healthScore: 89,
    license: 'MIT',
    isGoodFirstIssue: true,
    isBeginnerFriendly: true,
  },
  {
    id: '6',
    name: 'vllm',
    owner: 'vllm-project',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/132144883?v=4',
    description: 'A high-throughput and memory-efficient LLM serving engine with PagedAttention.',
    language: 'Python',
    stars: 31200,
    forks: 4300,
    openIssues: 210,
    lastUpdated: '2 hours ago',
    topics: ['llm-serving', 'cuda', 'paged-attention', 'inference'],
    aiSummary: 'Industry-standard LLM inference server featuring PagedAttention and continuous batching.',
    healthScore: 95,
    license: 'Apache-2.0',
    isGoodFirstIssue: false,
    isBeginnerFriendly: false,
  },
];

const SAMPLE_AI_PICKS: AIPickItem[] = [
  {
    id: 'p1',
    name: 'open-webui',
    owner: 'open-webui',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/155099307?v=4',
    description: 'User-friendly WebUI for Ollama, OpenAI, and Anthropic APIs with RAG support.',
    whyRecommended: 'Perfect project to study full-stack SvelteKit + Python integration for local AI tools.',
    difficulty: 'Intermediate',
    bestFor: 'Contribution',
    estimatedTime: '2 - 3 hours',
    technologies: ['Svelte', 'Python', 'WebSockets', 'Ollama'],
    stars: 42100,
    language: 'Python',
  },
  {
    id: 'p2',
    name: 'hono',
    owner: 'honojs',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/112689098?v=4',
    description: 'Fast, lightweight, Web-standard HTTP framework for Cloudflare Workers, Deno, Bun, and Node.js.',
    whyRecommended: 'Clean TypeScript architecture demonstrating web standards and cross-runtime compatibility.',
    difficulty: 'Beginner',
    bestFor: 'Learning',
    estimatedTime: '1 hour',
    technologies: ['TypeScript', 'Web APIs', 'Cloudflare Workers', 'Bun'],
    stars: 21500,
    language: 'TypeScript',
  },
  {
    id: 'p3',
    name: 'tauri',
    owner: 'tauri-apps',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/53023027?v=4',
    description: 'Build smaller, faster, and more secure desktop & mobile applications with web frontend.',
    whyRecommended: 'Top recommendation if you want to bridge Rust system code with React/Vue frontend UI.',
    difficulty: 'Advanced',
    bestFor: 'Production',
    estimatedTime: '1 - 2 days',
    technologies: ['Rust', 'TypeScript', 'System APIs', 'Webview'],
    stars: 84300,
    language: 'Rust',
  },
  {
    id: 'p4',
    name: 'excalibur',
    owner: 'excaliburjs',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/7463567?v=4',
    description: 'An easy to use 2D HTML5 Canvas game engine written in TypeScript.',
    whyRecommended: 'Excellent codebase for learning object-oriented game loops, ECS architecture, and physics.',
    difficulty: 'Beginner',
    bestFor: 'Learning',
    estimatedTime: '4 hours',
    technologies: ['TypeScript', 'HTML5 Canvas', 'WebGL'],
    stars: 6200,
    language: 'TypeScript',
  },
];

const SAMPLE_TOPICS: TopicItem[] = [
  { id: 't1', name: 'Artificial Intelligence', category: 'AI & ML', repoCount: '184.2k', growth: '+28.4%', iconName: 'Sparkles', description: 'LLMs, Neural Networks, Machine Learning frameworks & AI agents.', color: 'from-purple-500/20 to-blue-500/20' },
  { id: 't2', name: 'React', category: 'Frontend', repoCount: '310.5k', growth: '+14.2%', iconName: 'Code2', description: 'React ecosystem, Next.js, component libraries, state management.', color: 'from-cyan-500/20 to-blue-500/20' },
  { id: 't3', name: 'TypeScript', category: 'Languages', repoCount: '245.8k', growth: '+19.1%', iconName: 'Layers', description: 'Typed JavaScript, full-stack frameworks, type-safe utilities.', color: 'from-blue-500/20 to-indigo-500/20' },
  { id: 't4', name: 'Node.js', category: 'Backend', repoCount: '198.3k', growth: '+9.8%', iconName: 'Zap', description: 'Server-side JavaScript runtime, APIs, microservices & tooling.', color: 'from-emerald-500/20 to-teal-500/20' },
  { id: 't5', name: 'Python', category: 'Languages', repoCount: '412.0k', growth: '+22.5%', iconName: 'Activity', description: 'Data science, automation, web backends, and AI pipelines.', color: 'from-amber-500/20 to-emerald-500/20' },
  { id: 't6', name: 'Machine Learning', category: 'AI & ML', repoCount: '128.4k', growth: '+24.7%', iconName: 'TrendingUp', description: 'TensorFlow, PyTorch, Scikit-Learn, and model fine-tuning.', color: 'from-violet-500/20 to-fuchsia-500/20' },
  { id: 't7', name: 'DevOps', category: 'Infrastructure', repoCount: '95.1k', growth: '+11.3%', iconName: 'SlidersHorizontal', description: 'CI/CD, Infrastructure as Code, Terraform, Ansible, GitOps.', color: 'from-rose-500/20 to-amber-500/20' },
  { id: 't8', name: 'Cyber Security', category: 'Security', repoCount: '64.9k', growth: '+16.8%', iconName: 'Shield', description: 'Ethical hacking, pentesting, cryptography, security scanners.', color: 'from-red-500/20 to-rose-500/20' },
  { id: 't9', name: 'Blockchain', category: 'Web3', repoCount: '48.2k', growth: '+7.4%', iconName: 'Compass', description: 'Smart contracts, Solidity, Web3.js, decentralized protocols.', color: 'from-indigo-500/20 to-purple-500/20' },
  { id: 't10', name: 'Data Science', category: 'Analytics', repoCount: '112.6k', growth: '+18.2%', iconName: 'Award', description: 'Data pipelines, Jupyter notebooks, pandas, data visualization.', color: 'from-teal-500/20 to-cyan-500/20' },
  { id: 't11', name: 'Cloud Computing', category: 'Infrastructure', repoCount: '87.4k', growth: '+15.6%', iconName: 'Layers', description: 'AWS, GCP, Azure, serverless architectures, multi-cloud.', color: 'from-sky-500/20 to-blue-500/20' },
  { id: 't12', name: 'Docker', category: 'DevOps', repoCount: '135.9k', growth: '+12.1%', iconName: 'Tag', description: 'Containerization, Dockerfiles, Compose multi-container setups.', color: 'from-blue-500/20 to-cyan-500/20' },
];

const SAMPLE_DEVELOPERS: DeveloperItem[] = [
  {
    id: 'd1',
    name: 'Shadcn',
    username: 'shadcn',
    avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',
    followers: 48200,
    publicRepos: 34,
    totalStars: 98400,
    topRepo: 'shadcn/ui',
    heatScore: 99,
  },
  {
    id: 'd2',
    name: 'Guillermo Rauch',
    username: 'rauchg',
    avatar: 'https://avatars.githubusercontent.com/u/13041?v=4',
    followers: 78900,
    publicRepos: 112,
    totalStars: 145000,
    topRepo: 'vercel/next.js',
    heatScore: 97,
  },
  {
    id: 'd3',
    name: 'Sora Morimoto',
    username: 'soramori',
    avatar: 'https://avatars.githubusercontent.com/u/2070390?v=4',
    followers: 12400,
    publicRepos: 89,
    totalStars: 24500,
    topRepo: 'biomejs/biome',
    heatScore: 94,
  },
  {
    id: 'd4',
    name: 'Rudra Tiwari',
    username: 'tiwar95562',
    avatar: 'https://github.com/Rudra152005.png',
    followers: 892,
    publicRepos: 42,
    totalStars: 1540,
    topRepo: 'Rudra152005/Github-Analyzer',
    heatScore: 96,
  },
];

const SAMPLE_HIDDEN_GEMS: HiddenGemItem[] = [
  {
    id: 'hg1',
    name: 'hyper-fetch',
    owner: 'BetterTyped',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/78912441?v=4',
    description: 'Zero-dependency data exchange framework for web apps. Replaces Axios and React Query with 1kb overhead.',
    stars: 840,
    codeQualityScore: 97,
    docsQualityScore: 98,
    activityLevel: 'Very High',
    aiRecommendation: 'Outstanding architectural design with 100% test coverage and typed offline persistence.',
    language: 'TypeScript',
  },
  {
    id: 'hg2',
    name: 'fast-check',
    owner: 'dubzzz',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/5329302?v=4',
    description: 'Property-based testing framework for JavaScript/TypeScript. Automatically generates thousands of test cases.',
    stars: 3420,
    codeQualityScore: 99,
    docsQualityScore: 96,
    activityLevel: 'High',
    aiRecommendation: 'Identifies edge-case bugs in complex state logic before production deployment.',
    language: 'TypeScript',
  },
  {
    id: 'hg3',
    name: 'litellm',
    owner: 'BerriAI',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/132431289?v=4',
    description: 'Call 100+ LLM APIs using OpenAI format (Claude, Gemini, Llama, Bedrock) with instant fallback routing.',
    stars: 11200,
    codeQualityScore: 94,
    docsQualityScore: 92,
    activityLevel: 'Very High',
    aiRecommendation: 'Must-have utility for multi-LLM resilience and latency-based provider failover.',
    language: 'Python',
  },
];

const SAMPLE_TECH_TRENDS: TechTrend[] = [
  { name: 'React', growth: '+18.4%', popularityScore: 98, sparkline: [40, 45, 55, 62, 70, 85, 98], category: 'Frontend' },
  { name: 'TypeScript', growth: '+24.1%', popularityScore: 96, sparkline: [35, 42, 50, 65, 80, 88, 96], category: 'Languages' },
  { name: 'Rust', growth: '+31.8%', popularityScore: 92, sparkline: [20, 30, 45, 58, 70, 84, 92], category: 'Systems' },
  { name: 'Go', growth: '+16.5%', popularityScore: 89, sparkline: [45, 50, 58, 64, 75, 82, 89], category: 'Backend' },
  { name: 'Next.js', growth: '+22.0%', popularityScore: 95, sparkline: [50, 58, 66, 75, 85, 90, 95], category: 'Fullstack' },
  { name: 'Docker', growth: '+12.3%', popularityScore: 94, sparkline: [60, 65, 72, 78, 85, 90, 94], category: 'DevOps' },
  { name: 'Kubernetes', growth: '+15.7%', popularityScore: 88, sparkline: [40, 48, 55, 65, 74, 82, 88], category: 'Cloud' },
  { name: 'Python', growth: '+28.9%', popularityScore: 99, sparkline: [55, 65, 72, 80, 88, 94, 99], category: 'AI & Data' },
  { name: 'AI Agents', growth: '+42.5%', popularityScore: 97, sparkline: [10, 25, 40, 60, 78, 89, 97], category: 'AI' },
];

// ─── MAIN EXPLORE PAGE COMPONENT ─────────────────────────────────────────────

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  
  // Filter States
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [minStars, setMinStars] = useState<string>('All');
  const [licenseFilter, setLicenseFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('trending');
  const [goodFirstIssueOnly, setGoodFirstIssueOnly] = useState(false);
  const [beginnerFriendlyOnly, setBeginnerFriendlyOnly] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Toggle follow status
  const toggleFollow = (username: string) => {
    setFollowingMap((prev) => ({ ...prev, [username]: !prev[username] }));
  };

  // Filtered Repos
  const filteredTrendingRepos = useMemo(() => {
    return SAMPLE_TRENDING_REPOS.filter((repo) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = repo.name.toLowerCase().includes(query);
        const matchesOwner = repo.owner.toLowerCase().includes(query);
        const matchesDesc = repo.description.toLowerCase().includes(query);
        const matchesTopics = repo.topics.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesOwner && !matchesDesc && !matchesTopics) return false;
      }
      if (selectedLanguage !== 'All' && repo.language !== selectedLanguage) return false;
      if (minStars === '1000' && repo.stars < 1000) return false;
      if (minStars === '5000' && repo.stars < 5000) return false;
      if (minStars === '20000' && repo.stars < 20000) return false;
      if (licenseFilter !== 'All' && repo.license !== licenseFilter) return false;
      if (goodFirstIssueOnly && !repo.isGoodFirstIssue) return false;
      if (beginnerFriendlyOnly && !repo.isBeginnerFriendly) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'health') return b.healthScore - a.healthScore;
      return b.stars - a.stars;
    });
  }, [search, selectedLanguage, minStars, licenseFilter, sortBy, goodFirstIssueOnly, beginnerFriendlyOnly]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-7xl mx-auto pb-12"
    >
      {/* ─── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary">
              <Compass className="w-7 h-7" />
            </div>
            Explore GitHub Universe
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            Discover trending repositories, AI recommendations, top developers, and emerging technologies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-primary animate-pulse" />
            AI-Enhanced Curation
          </Badge>
        </div>
      </div>

      {/* ─── SEARCH BAR & FILTER TOGGLE ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Input
            placeholder="Search repositories, developers, organizations, or technologies..."
            icon={<Search className="w-5 h-5 text-accent-primary" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 text-base pl-11 pr-10 rounded-xl bg-light-surface dark:bg-dark-card border-light-border dark:border-dark-border shadow-soft"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant={showFilterDrawer ? 'primary' : 'outline'}
          className="h-12 px-5 flex items-center gap-2 rounded-xl border-light-border dark:border-dark-border"
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {(selectedLanguage !== 'All' || minStars !== 'All' || licenseFilter !== 'All' || goodFirstIssueOnly || beginnerFriendlyOnly) && (
            <span className="w-2 h-2 rounded-full bg-accent-primary" />
          )}
        </Button>
      </div>

      {/* ─── FILTER SIDEBAR / DRAWER ───────────────────────────────────────── */}
      <AnimatePresence>
        {showFilterDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card padding="md" className="bg-light-surface-secondary/80 dark:bg-dark-card/90 border border-light-border dark:border-dark-border rounded-xl backdrop-blur-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {/* Language */}
                <div>
                  <label className="text-text-muted dark:text-text-dark-muted font-medium mb-1.5 block">Programming Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border text-text-primary dark:text-white focus:outline-none focus:border-accent-primary"
                  >
                    <option value="All">All Languages</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Python">Python</option>
                    <option value="Go">Go</option>
                    <option value="Rust">Rust</option>
                    <option value="JavaScript">JavaScript</option>
                  </select>
                </div>

                {/* Min Stars */}
                <div>
                  <label className="text-text-muted dark:text-text-dark-muted font-medium mb-1.5 block">Minimum Stars</label>
                  <select
                    value={minStars}
                    onChange={(e) => setMinStars(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border text-text-primary dark:text-white focus:outline-none focus:border-accent-primary"
                  >
                    <option value="All">Any Stars</option>
                    <option value="1000">1,000+ Stars</option>
                    <option value="5000">5,000+ Stars</option>
                    <option value="20000">20,000+ Stars</option>
                  </select>
                </div>

                {/* License */}
                <div>
                  <label className="text-text-muted dark:text-text-dark-muted font-medium mb-1.5 block">License</label>
                  <select
                    value={licenseFilter}
                    onChange={(e) => setLicenseFilter(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border text-text-primary dark:text-white focus:outline-none focus:border-accent-primary"
                  >
                    <option value="All">All Licenses</option>
                    <option value="MIT">MIT License</option>
                    <option value="Apache-2.0">Apache 2.0</option>
                    <option value="GPL-3.0">GPL-3.0</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-text-muted dark:text-text-dark-muted font-medium mb-1.5 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border text-text-primary dark:text-white focus:outline-none focus:border-accent-primary"
                  >
                    <option value="trending">Most Trending</option>
                    <option value="stars">Most Starred</option>
                    <option value="health">Highest Health Score</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 mt-4 pt-3 border-t border-light-border dark:border-dark-border/50 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-text-secondary dark:text-text-dark-secondary">
                  <input
                    type="checkbox"
                    checked={goodFirstIssueOnly}
                    onChange={(e) => setGoodFirstIssueOnly(e.target.checked)}
                    className="rounded border-light-border dark:border-dark-border text-accent-primary focus:ring-accent-primary"
                  />
                  <span>Good First Issue Only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-text-secondary dark:text-text-dark-secondary">
                  <input
                    type="checkbox"
                    checked={beginnerFriendlyOnly}
                    onChange={(e) => setBeginnerFriendlyOnly(e.target.checked)}
                    className="rounded border-light-border dark:border-dark-border text-accent-primary focus:ring-accent-primary"
                  />
                  <span>Beginner Friendly</span>
                </label>

                {(selectedLanguage !== 'All' || minStars !== 'All' || licenseFilter !== 'All' || goodFirstIssueOnly || beginnerFriendlyOnly) && (
                  <button
                    onClick={() => {
                      setSelectedLanguage('All');
                      setMinStars('All');
                      setLicenseFilter('All');
                      setGoodFirstIssueOnly(false);
                      setBeginnerFriendlyOnly(false);
                    }}
                    className="text-accent-primary hover:underline ml-auto"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TRENDING TECHNOLOGIES CAROUSEL ─────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-primary" />
            <h2 className="text-base font-semibold text-text-primary dark:text-white">Trending Technologies This Week</h2>
          </div>
          <span className="text-xs text-text-muted dark:text-text-dark-muted">Updated real-time</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
          {SAMPLE_TECH_TRENDS.map((tech) => (
            <motion.div
              key={tech.name}
              whileHover={{ y: -3 }}
              className="snap-start min-w-[200px] flex-1 bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-3 shadow-soft flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-text-muted dark:text-text-dark-muted">{tech.category}</p>
                <p className="text-sm font-bold text-text-primary dark:text-white mt-0.5">{tech.name}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs">
                  <span className="text-emerald-400 font-semibold">{tech.growth}</span>
                  <span className="text-[10px] text-text-muted dark:text-text-dark-muted">({tech.popularityScore}/100)</span>
                </div>
              </div>
              <div className="pt-1">
                <MiniSparkline data={tech.sparkline} color={tech.growth.startsWith('+') ? '#10B981' : '#F59E0B'} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── NAVIGATION TABS ───────────────────────────────────────────────── */}
      <div className="border-b border-light-border dark:border-dark-border pb-1">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'trending', label: 'Trending', icon: TrendingUp, count: filteredTrendingRepos.length },
            { id: 'ai-picks', label: 'AI Picks', icon: Sparkles, count: SAMPLE_AI_PICKS.length },
            { id: 'topics', label: 'Topics', icon: Tag, count: SAMPLE_TOPICS.length },
            { id: 'developers', label: 'Developers', icon: Users, count: SAMPLE_DEVELOPERS.length },
            { id: 'hidden-gems', label: 'Hidden Gems', icon: Award, count: SAMPLE_HIDDEN_GEMS.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'text-accent-primary font-semibold'
                    : 'text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-accent-primary' : 'text-text-muted'}`} />
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-accent-primary/20 text-accent-primary' : 'bg-light-surface-secondary dark:bg-dark-card text-text-muted'}`}>
                  {tab.count}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-accent-primary/10 border border-accent-primary/30 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── MAIN CONTENT AREA WITH SIDEBAR ─────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* LEFT / CENTER: MAIN TAB CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {/* ── TAB 1: TRENDING ─────────────────────────────────────────── */}
            {activeTab === 'trending' && (
              <motion.div
                key="trending-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {filteredTrendingRepos.length === 0 ? (
                  <Card padding="lg" className="text-center py-12">
                    <AlertCircle className="w-10 h-10 text-accent-warning mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-text-primary dark:text-white">No matching repositories found</h3>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted mt-1">Try clearing your filters or adjusting your search query.</p>
                  </Card>
                ) : (
                  filteredTrendingRepos.map((repo, idx) => {
                    const langStyle = LANGUAGE_COLORS[repo.language] || { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' };
                    return (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <Card variant="interactive" padding="lg" className="relative group">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={repo.ownerAvatar}
                                alt={repo.owner}
                                className="w-10 h-10 rounded-xl object-cover border border-light-border dark:border-dark-border flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`https://github.com/${repo.owner}/${repo.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg font-bold text-text-primary dark:text-white hover:text-accent-primary transition-colors truncate"
                                  >
                                    {repo.owner} / <span className="text-accent-primary">{repo.name}</span>
                                  </a>
                                </div>
                                <p className="text-xs text-text-muted dark:text-text-dark-muted">Updated {repo.lastUpdated}</p>
                              </div>
                            </div>

                            {/* Circular Health Score */}
                            <div className="flex items-center gap-2">
                              <div className="text-right hidden sm:block">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted dark:text-text-dark-muted">Health</p>
                                <p className="text-xs font-semibold text-text-primary dark:text-white">{repo.healthScore}/100</p>
                              </div>
                              <CircularHealthScore score={repo.healthScore} size={44} />
                            </div>
                          </div>

                          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4 leading-relaxed line-clamp-2">
                            {repo.description}
                          </p>

                          {/* AI Summary Box */}
                          <div className="p-3 rounded-xl bg-accent-primary/5 border border-accent-primary/15 mb-4 flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-text-primary dark:text-white font-medium leading-normal">
                              <span className="text-accent-primary font-bold">AI Assessment: </span>
                              {repo.aiSummary}
                            </p>
                          </div>

                          {/* Topics Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-4">
                            {repo.topics.map((t) => (
                              <span
                                key={t}
                                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-light-surface-secondary dark:bg-dark-card-elevated text-text-secondary dark:text-text-dark-secondary border border-light-border dark:border-dark-border"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>

                          {/* Footer Stats & Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-light-border dark:border-dark-border/60 text-xs text-text-muted dark:text-text-dark-muted">
                            <div className="flex items-center gap-4 flex-wrap">
                              {/* Language */}
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${langStyle.bg} ${langStyle.text} font-medium`}>
                                <span className={`w-2 h-2 rounded-full ${langStyle.dot}`} />
                                {repo.language}
                              </span>

                              <span className="flex items-center gap-1 text-text-primary dark:text-white font-medium">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                {repo.stars.toLocaleString()}
                              </span>

                              <span className="flex items-center gap-1">
                                <GitFork className="w-3.5 h-3.5" />
                                {repo.forks.toLocaleString()}
                              </span>

                              <span className="flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {repo.openIssues} issues
                              </span>
                            </div>

                            <a
                              href={`https://github.com/${repo.owner}/${repo.name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg flex items-center gap-1">
                                View Analysis
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* ── TAB 2: AI PICKS ─────────────────────────────────────────── */}
            {activeTab === 'ai-picks' && (
              <motion.div
                key="ai-picks-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {SAMPLE_AI_PICKS.map((pick, idx) => (
                  <motion.div
                    key={pick.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card padding="lg" className="border border-accent-primary/30 bg-gradient-to-br from-accent-primary/5 via-light-surface dark:via-dark-card to-transparent relative">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant="success" className="px-2.5 py-1 text-xs font-semibold flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                          <Sparkles className="w-3.5 h-3.5" />
                          Recommended by AI
                        </Badge>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-light-surface-secondary dark:bg-dark-card-elevated border border-light-border dark:border-dark-border text-text-secondary dark:text-text-dark-secondary">
                            Level: <span className="text-text-primary dark:text-white font-semibold">{pick.difficulty}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                            Best for: {pick.bestFor}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                            {pick.owner} / <span className="text-accent-primary">{pick.name}</span>
                          </h3>
                          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">{pick.description}</p>
                        </div>
                      </div>

                      {/* Why Recommended Rationale Box */}
                      <div className="p-3.5 rounded-xl bg-light-surface-secondary dark:bg-dark-bg/60 border border-light-border dark:border-dark-border mb-4">
                        <p className="text-xs text-text-primary dark:text-white">
                          <span className="font-bold text-accent-primary">Why Recommended: </span>
                          {pick.whyRecommended}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1 text-text-muted dark:text-text-dark-muted">
                            <Clock className="w-3.5 h-3.5 text-accent-primary" />
                            Est. Time: <strong className="text-text-primary dark:text-white">{pick.estimatedTime}</strong>
                          </span>
                          <span className="flex items-center gap-1 text-text-muted dark:text-text-dark-muted">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            {pick.stars.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {pick.technologies.map((tech) => (
                            <span key={tech} className="px-2 py-0.5 rounded text-[10px] bg-light-surface-secondary dark:bg-dark-card-elevated text-text-muted dark:text-text-dark-muted border border-light-border dark:border-dark-border">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── TAB 3: TOPICS ───────────────────────────────────────────── */}
            {activeTab === 'topics' && (
              <motion.div
                key="topics-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {SAMPLE_TOPICS.map((topic) => (
                  <motion.div
                    key={topic.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card padding="md" className="h-full border border-light-border dark:border-dark-border hover:border-accent-primary/40 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                          <Tag className="w-5 h-5" />
                        </div>

                        <Badge variant="success" className="text-[10px] px-2 py-0.5 font-bold">
                          {topic.growth}
                        </Badge>
                      </div>

                      <h3 className="text-base font-bold text-text-primary dark:text-white mb-1">{topic.name}</h3>
                      <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-3 leading-relaxed">{topic.description}</p>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-light-border dark:border-dark-border/50 text-text-muted dark:text-text-dark-muted">
                        <span>{topic.repoCount} repositories</span>
                        <span className="text-accent-primary font-medium flex items-center gap-0.5">
                          Explore Topic <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── TAB 4: POPULAR DEVELOPERS ───────────────────────────────── */}
            {activeTab === 'developers' && (
              <motion.div
                key="developers-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {SAMPLE_DEVELOPERS.map((dev, idx) => {
                  const isFollowing = followingMap[dev.username] ?? dev.isFollowing;
                  return (
                    <motion.div
                      key={dev.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              src={dev.avatar}
                              alt={dev.name}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-accent-primary flex-shrink-0"
                            />
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-dark-card" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-text-primary dark:text-white">{dev.name}</h3>
                              <span className="text-xs text-text-muted dark:text-text-dark-muted">@{dev.username}</span>
                            </div>
                            <p className="text-xs text-accent-primary font-medium mt-0.5">
                              Top Repo: <span className="underline">{dev.topRepo}</span>
                            </p>

                            <div className="flex items-center gap-4 text-xs text-text-muted dark:text-text-dark-muted mt-2">
                              <span><strong className="text-text-primary dark:text-white">{dev.followers.toLocaleString()}</strong> Followers</span>
                              <span><strong className="text-text-primary dark:text-white">{dev.publicRepos}</strong> Repos</span>
                              <span><strong className="text-text-primary dark:text-white">{(dev.totalStars / 1000).toFixed(1)}k</strong> Stars</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-light-border dark:border-dark-border">
                          {/* Heat Score Bar */}
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 text-xs text-text-muted dark:text-text-dark-muted mb-1">
                              <Flame className="w-3.5 h-3.5 text-orange-400" />
                              <span>Contribution Heat: <strong className="text-text-primary dark:text-white">{dev.heatScore}%</strong></span>
                            </div>
                            <div className="w-32 h-2 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: `${dev.heatScore}%` }} />
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant={isFollowing ? 'outline' : 'primary'}
                            className="h-8 px-4 text-xs rounded-lg flex items-center gap-1.5"
                            onClick={() => toggleFollow(dev.username)}
                          >
                            {isFollowing ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                Follow
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ── TAB 5: HIDDEN GEMS ──────────────────────────────────────── */}
            {activeTab === 'hidden-gems' && (
              <motion.div
                key="hidden-gems-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {SAMPLE_HIDDEN_GEMS.map((gem, idx) => (
                  <motion.div
                    key={gem.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card padding="lg" className="border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-light-surface dark:via-dark-card to-transparent">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 border-amber-500/40">
                          ⭐ Hidden Gem
                        </Badge>
                        <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          Activity: {gem.activityLevel}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1">
                        {gem.owner} / <span className="text-accent-primary">{gem.name}</span>
                      </h3>
                      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3">{gem.description}</p>

                      <div className="p-3 rounded-xl bg-light-surface-secondary dark:bg-dark-bg/60 border border-light-border dark:border-dark-border mb-4">
                        <p className="text-xs text-text-primary dark:text-white">
                          <span className="font-bold text-amber-400">AI Recommendation: </span>
                          {gem.aiRecommendation}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-light-border dark:border-dark-border/50 text-text-muted dark:text-text-dark-muted">
                        <div className="flex items-center gap-4">
                          <span>Stars: <strong className="text-text-primary dark:text-white">{gem.stars}</strong></span>
                          <span>Code Quality: <strong className="text-emerald-400">{gem.codeQualityScore}%</strong></span>
                          <span>Docs Quality: <strong className="text-cyan-400">{gem.docsQualityScore}%</strong></span>
                        </div>

                        <a href={`https://github.com/${gem.owner}/${gem.name}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg">
                            Inspect Repository
                          </Button>
                        </a>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT SIDEBAR: AI INSIGHTS FLOATING PANEL */}
        <div className="space-y-6">
          <Card padding="lg" className="border border-accent-primary/20 bg-gradient-to-b from-accent-primary/5 via-light-surface dark:via-dark-card to-transparent sticky top-6 shadow-soft-lg">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-light-border dark:border-dark-border">
              <Sparkles className="w-5 h-5 text-accent-primary" />
              <h2 className="text-base font-bold text-text-primary dark:text-white">AI Insights Panel</h2>
            </div>

            <div className="space-y-4 text-xs">
              {/* Repo of the week */}
              <div className="p-3 rounded-xl bg-light-surface-secondary dark:bg-dark-bg/60 border border-light-border dark:border-dark-border">
                <p className="text-[10px] uppercase font-bold tracking-wider text-accent-primary mb-1">🏆 Repo of the Week</p>
                <p className="font-bold text-text-primary dark:text-white text-sm">shadcn/ui</p>
                <p className="text-text-muted dark:text-text-dark-muted mt-1 leading-normal">
                  Gained +2,400 stars this week. Leading component model across Next.js ecosystems.
                </p>
              </div>

              {/* Most Active Today */}
              <div className="p-3 rounded-xl bg-light-surface-secondary dark:bg-dark-bg/60 border border-light-border dark:border-dark-border">
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-1">🔥 Most Active Today</p>
                <p className="font-bold text-text-primary dark:text-white">infiniflow / ragflow</p>
                <p className="text-text-muted dark:text-text-dark-muted mt-1">
                  142 commits pushed in the last 24 hours.
                </p>
              </div>

              {/* Fastest Growing Language */}
              <div className="p-3 rounded-xl bg-light-surface-secondary dark:bg-dark-bg/60 border border-light-border dark:border-dark-border">
                <p className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 mb-1">🚀 Fastest Growing Language</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-text-primary dark:text-white">Rust</span>
                  <span className="text-emerald-400 font-bold">+31.8%</span>
                </div>
                <p className="text-text-muted dark:text-text-dark-muted mt-1">
                  Driven by fast tooling adoption (Biome, Tauri, SWC).
                </p>
              </div>

              {/* Trending Topic */}
              <div className="p-3 rounded-xl bg-light-surface-secondary dark:bg-dark-bg/60 border border-light-border dark:border-dark-border">
                <p className="text-[10px] uppercase font-bold tracking-wider text-purple-400 mb-1">💡 Trending Topic</p>
                <span className="font-bold text-text-primary dark:text-white">#AI-Agents</span>
                <p className="text-text-muted dark:text-text-dark-muted mt-1">
                  12 new frameworks launched in the past 7 days.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
