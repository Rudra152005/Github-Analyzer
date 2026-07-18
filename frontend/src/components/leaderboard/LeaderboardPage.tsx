import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Medal,
  TrendingUp,
  Flame,
  GitBranch,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Badge, Button } from '../ui';
import { api } from '../../lib/api';
import { LeaderboardEntry } from '../../types';

const timeRanges = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'devops', label: 'DevOps' },
  { value: 'ai-ml', label: 'AI/ML' },
];

export default function LeaderboardPage() {
  const [timeRange, setTimeRange] = useState('week');
  const [category, setCategory] = useState('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await api.leaderboard.getLeaderboard(timeRange, category);
        setLeaderboard(data);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [timeRange, category]);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-amber-400 to-amber-600 text-dark-bg';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-dark-bg';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white';
    return 'bg-light-surface-secondary dark:bg-dark-card text-text-primary dark:text-white';
  };

  const topThree = leaderboard.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-accent-primary" />
            Leaderboard
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            Top developers ranked by contribution score
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 p-1 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === range.value
                  ? 'bg-light-surface dark:bg-dark-card-elevated text-accent-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 px-3 rounded-lg border bg-light-surface dark:bg-dark-card border-light-border dark:border-dark-border text-text-primary dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div key="loading" className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Top 3 Highlights */}
            {topThree.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4">
                {topThree.map((user, index) => (
                  <motion.div
                    key={user.username}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {index === 0 && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                        <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-dark-bg" />
                        </div>
                      </div>
                    )}
                    <Card
                      padding="lg"
                      variant="elevated"
                      className={`pt-8 ${index === 0 ? 'border-accent-primary' : ''}`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-full ${getRankStyle(user.rank)} flex items-center justify-center text-2xl font-bold mb-4`}>
                          {user.rank}
                        </div>
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-20 h-20 rounded-full object-cover border-4 border-accent-primary mb-3"
                        />
                        <h3 className="font-semibold text-text-primary dark:text-white">@{user.username}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="success">{user.score}</Badge>
                          <Badge variant="outline">{user.repositories} repos</Badge>
                          <Badge variant="outline" className="border-accent-primary/45 text-accent-primary">{user.followers} followers</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-sm text-text-muted dark:text-text-dark-muted">
                          <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-accent-primary" />
                            {user.streak} days
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {user.contributions}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Full Leaderboard */}
            <Card padding="lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-accent-primary" />
                  Full Rankings
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={user.username}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    className="flex items-center gap-4 p-4 bg-light-surface-secondary dark:bg-dark-card rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full ${getRankStyle(user.rank)} flex items-center justify-center text-sm font-bold`}>
                      {user.rank}
                    </div>
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-accent-primary flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary dark:text-white">@{user.username}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-text-muted dark:text-text-dark-muted">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-accent-primary" />
                          {user.followers} followers
                        </div>
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {user.repositories} repos
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {user.contributions} contributions
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {user.streak} day streak
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-accent-primary">{user.score}</p>
                      <p className="text-xs text-text-muted dark:text-text-dark-muted">Score</p>
                    </div>
                    <a href={`https://github.com/${user.username.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </a>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
