import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, Users, Trophy, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Input, Badge } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { ComparisonResult } from '../../types';

export default function ComparePage() {
  const { user } = useAuth();
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('sarahcodes');
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  useEffect(() => {
    if (user) {
      setUser1(user.username);
    }
  }, [user]);

  const handleCompare = async () => {
    if (!user1.trim() || !user2.trim()) {
      alert('Please enter both GitHub usernames');
      return;
    }
    setIsComparing(true);
    try {
      const data = await api.compare.compareUsers(user1.trim(), user2.trim());
      setResult(data);
    } catch (err: any) {
      alert(err.message || 'Failed to compare developers');
    } finally {
      setIsComparing(false);
    }
  };

  const getWinnerName = () => {
    if (!result) return '';
    if (result.winner === 'user1') return result.user1.name || result.user1.username;
    if (result.winner === 'user2') return result.user2.name || result.user2.username;
    return 'Tie';
  };

  const metrics = result ? [
    { label: 'Repositories', user1: result.stats1.repositories, user2: result.stats2.repositories },
    { label: 'Followers', user1: result.stats1.followers, user2: result.stats2.followers },
    { label: 'Contributions', user1: result.stats1.contributions, user2: result.stats2.contributions },
    { label: 'Streak', user1: result.stats1.streak, user2: result.stats2.streak },
  ] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-white flex items-center gap-2">
          <GitCompare className="w-7 h-7 text-accent-primary" />
          Compare Developers
        </h1>
        <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
          Compare GitHub profiles and see who comes out on top
        </p>
      </div>

      {/* Comparison Controls */}
      <Card padding="lg">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Input
              placeholder="First GitHub username"
              value={user1}
              onChange={(e) => setUser1(e.target.value)}
              icon={<Users className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
              <GitCompare className="w-6 h-6 text-accent-primary" />
            </div>
          </div>
          <div className="flex-1 w-full">
            <Input
              placeholder="Second GitHub username"
              value={user2}
              onChange={(e) => setUser2(e.target.value)}
              icon={<Users className="w-4 h-4" />}
            />
          </div>
          <Button onClick={handleCompare} isLoading={isComparing}>Compare</Button>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {isComparing && (
          <div key="comparing" className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-muted dark:text-text-dark-muted animate-pulse">
              Gemini AI is comparing the repositories, contribution activity, and streaks...
            </p>
          </div>
        )}

        {!isComparing && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Profile Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* User 1 */}
              <Card padding="lg" className={result.winner === 'user1' ? 'border-2 border-accent-primary' : 'border border-light-border dark:border-dark-border'}>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={result.user1.avatar}
                    alt={result.user1.name || result.user1.username}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-accent-primary flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-text-primary dark:text-white">
                        {result.user1.name || result.user1.username}
                      </h3>
                      {result.winner === 'user1' && (
                        <Trophy className="w-4 h-4 text-accent-primary" />
                      )}
                    </div>
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                      @{result.user1.username}
                    </p>
                    {result.user1.company && (
                      <Badge variant="outline" className="mt-1">{result.user1.company}</Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-light-surface-secondary dark:bg-dark-card rounded-lg text-center">
                    <p className="text-xl font-bold text-text-primary dark:text-white">{result.user1.publicRepos}</p>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted">Repos</p>
                  </div>
                  <div className="p-3 bg-light-surface-secondary dark:bg-dark-card rounded-lg text-center">
                    <p className="text-xl font-bold text-text-primary dark:text-white">{result.user1.followers}</p>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted">Followers</p>
                  </div>
                </div>
              </Card>

              {/* User 2 */}
              <Card padding="lg" className={result.winner === 'user2' ? 'border-2 border-accent-warning' : 'border border-light-border dark:border-dark-border'}>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={result.user2.avatar}
                    alt={result.user2.name || result.user2.username}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-accent-warning flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-text-primary dark:text-white">
                        {result.user2.name || result.user2.username}
                      </h3>
                      {result.winner === 'user2' && (
                        <Trophy className="w-4 h-4 text-accent-warning" />
                      )}
                    </div>
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                      @{result.user2.username}
                    </p>
                    {result.user2.company && (
                      <Badge variant="outline" className="mt-1">{result.user2.company}</Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-light-surface-secondary dark:bg-dark-card rounded-lg text-center">
                    <p className="text-xl font-bold text-text-primary dark:text-white">{result.user2.publicRepos}</p>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted">Repos</p>
                  </div>
                  <div className="p-3 bg-light-surface-secondary dark:bg-dark-card rounded-lg text-center">
                    <p className="text-xl font-bold text-text-primary dark:text-white">{result.user2.followers}</p>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted">Followers</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Metrics Comparison */}
            <Card padding="lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent-primary" />
                  Metrics Comparison
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                {metrics.map((metric) => {
                  const max = Math.max(metric.user1, metric.user2) || 1;
                  const winner = metric.user1 > metric.user2 ? 'user1' : metric.user2 > metric.user1 ? 'user2' : 'tie';
                  return (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-text-primary dark:text-white">{metric.label}</span>
                        <span className="text-text-muted dark:text-text-dark-muted">
                          {winner === 'user1' ? `${result.user1.username} wins` : winner === 'user2' ? `${result.user2.username} wins` : 'Tie'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-text-muted dark:text-text-dark-muted">{result.user1.username}</span>
                            <span className="text-xs font-medium text-text-primary dark:text-white">{metric.user1}</span>
                          </div>
                          <div className="h-2 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-accent-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(metric.user1 / max) * 100}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-text-muted dark:text-text-dark-muted">{result.user2.username}</span>
                            <span className="text-xs font-medium text-text-primary dark:text-white">{metric.user2}</span>
                          </div>
                          <div className="h-2 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-accent-warning rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(metric.user2 / max) * 100}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* AI Summary Comparison */}
            <Card padding="lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-primary" />
                  AI Matchup Analysis
                </CardTitle>
              </CardHeader>
              <div className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed whitespace-pre-line p-4 bg-light-surface-secondary dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
                {result.analysis}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
