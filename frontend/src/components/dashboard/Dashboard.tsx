import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Star,
  GitFork,
  Users,
  TrendingUp,
  Calendar,
  Flame,
  Bookmark,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Badge } from '../ui';
import { ContributionHeatmap, LanguagePieChart, ContributionsChart } from '../charts';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Repository, ActivityData, LanguageStats } from '../../types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [languages, setLanguages] = useState<LanguageStats[]>([]);
  const [growth, setGrowth] = useState<{ month: string; stars: number; followers: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reposRes, activityRes, languagesRes, growthRes] = await Promise.all([
          api.user.getRepos(),
          api.user.getActivity(),
          api.user.getLanguages(),
          api.user.getGrowth(),
        ]);
        setRepos(reposRes);
        setActivity(activityRes);
        setLanguages(languagesRes);
        setGrowth(growthRes);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const topRepos = [...repos].sort((a, b) => b.healthScore - a.healthScore).slice(0, 3);

  const totalStars = repos.reduce((acc, repo) => acc + (repo.stars || 0), 0);
  const totalForks = repos.reduce((acc, repo) => acc + (repo.forks || 0), 0);

  const stats = [
    {
      icon: GitBranch,
      label: 'Repositories',
      value: repos.length || user.publicRepos,
      change: `${repos.length} total repos`,
    },
    {
      icon: Star,
      label: 'Stars Earned',
      value: totalStars,
      change: `across ${repos.length} repos`,
    },
    {
      icon: GitFork,
      label: 'Total Forks',
      value: totalForks,
      change: `across ${repos.length} repos`,
    },
    {
      icon: Bookmark,
      label: 'Starred Repos',
      value: user.starred || 0,
      change: 'starred by you',
    },
    {
      icon: Users,
      label: 'Followers',
      value: user.followers,
      change: '+89 this month',
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">
            Dashboard
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-primary/10 border border-accent-primary/20">
            <Flame className="w-4 h-4 text-accent-primary" />
            <span className="text-sm font-medium text-accent-primary">
              {user.streak} day streak
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} variant="interactive" padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-text-primary dark:text-white mt-1">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-accent-primary mt-1">{stat.change}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-accent-primary" />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Profile and Heatmap */}
      <motion.div variants={item} className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card padding="md">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-accent-primary"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white truncate">
                {user.name}
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                @{user.username}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="success">Pro</Badge>
                <Badge variant="outline">Open Source</Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary line-clamp-2">
              {user.bio}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
              <p className="text-lg font-bold text-text-primary dark:text-white">
                {user.contributions}
              </p>
              <p className="text-xs text-text-muted dark:text-text-dark-muted">
                Contributions
              </p>
            </div>
            <div className="p-2 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
              <p className="text-lg font-bold text-text-primary dark:text-white">
                {user.following}
              </p>
              <p className="text-xs text-text-muted dark:text-text-dark-muted">
                Following
              </p>
            </div>
            <div className="p-2 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
              <p className="text-lg font-bold text-text-primary dark:text-white">
                {user.streak}
              </p>
              <p className="text-xs text-text-muted dark:text-text-dark-muted">
                Streak
              </p>
            </div>
          </div>
        </Card>

        {/* Contribution Heatmap */}
        <Card padding="md" className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-primary" />
              Contribution Activity
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <ContributionHeatmap data={activity} />
          </div>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid lg:grid-cols-2 gap-6">
        {/* Languages */}
        <Card padding="md">
          <CardHeader className="pb-4">
            <CardTitle>Language Distribution</CardTitle>
          </CardHeader>
          <LanguagePieChart data={languages} />
        </Card>

        {/* Growth Chart */}
        <Card padding="md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-primary" />
              Growth Over Time
            </CardTitle>
          </CardHeader>
          <ContributionsChart
            data={growth}
            dataKey="stars"
            xAxisKey="month"
          />
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-primary" />
              <span className="text-text-secondary dark:text-text-dark-secondary">Stars</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Repositories */}
      <motion.div variants={item}>
        <Card padding="md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Top Repositories</CardTitle>
              <Badge variant="outline">View All</Badge>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {topRepos.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-3 bg-light-surface-secondary dark:bg-dark-card rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary dark:text-white">
                      {repo.name}
                    </p>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted">
                      {repo.language}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex flex-col items-end gap-0.5 text-xs text-text-secondary dark:text-text-dark-secondary">
                    <div>Complexity: <span className="font-semibold text-accent-primary">{repo.complexityScore}%</span></div>
                    <div>Market Fit: <span className="font-semibold text-accent-primary">{repo.marketRelevance}%</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={repo.healthScore >= 71 ? 'success' : repo.healthScore >= 41 ? 'warning' : 'danger'}
                      size="sm"
                    >
                      Health: {repo.healthScore}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
