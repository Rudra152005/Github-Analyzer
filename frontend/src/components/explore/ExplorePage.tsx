import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Search,
  TrendingUp,
  Star,
  Users,
  GitBranch,
  Flame,
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../ui';
import { api } from '../../lib/api';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'topics' | 'users'>('trending');
  const [trendingRepos, setTrendingRepos] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (search.trim()) {
          const type = activeTab === 'trending' ? 'repos' : activeTab === 'topics' ? 'topics' : 'users';
          const data = await api.explore.search(search.trim(), type);
          setSearchResults(data);
        } else {
          if (activeTab === 'trending') {
            const data = await api.explore.getTrendingRepos();
            setTrendingRepos(data);
          } else if (activeTab === 'topics') {
            const data = await api.explore.getTrendingTopics();
            setTrendingTopics(data);
          } else if (activeTab === 'users') {
            const data = await api.explore.getTopUsers();
            setTopUsers(data);
          }
        }
      } catch (err) {
        console.error('Explore fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(fetchData, 300);
    return () => clearTimeout(handler);
  }, [search, activeTab]);

  const displayRepos = search.trim() ? searchResults : trendingRepos;
  const displayTopics = search.trim() ? searchResults : trendingTopics;
  const displayUsers = search.trim() ? searchResults : topUsers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-white flex items-center gap-2">
          <Compass className="w-7 h-7 text-accent-primary" />
          Explore
        </h1>
        <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
          Discover trending repositories, topics, and developers
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl">
        <Input
          placeholder="Search repositories, topics, users..."
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-light-surface-secondary dark:bg-dark-card rounded-lg w-fit">
        {(['trending', 'topics', 'users'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchResults([]);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-light-surface dark:bg-dark-card-elevated text-accent-primary shadow-sm'
                : 'text-text-secondary dark:text-text-dark-secondary hover:text-text-primary'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div key="loading" className="flex items-center justify-center min-h-[30vh]">
            <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Trending Repositories */}
            {activeTab === 'trending' && (
              <motion.div
                key="trending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-accent-primary">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Trending Repositories</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayRepos.map((repo, index) => (
                    <motion.div
                      key={repo.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card variant="interactive" padding="md" className="h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm min-w-0">
                            <GitBranch className="w-4 h-4 text-accent-primary flex-shrink-0" />
                            <span className="font-medium text-text-primary dark:text-white truncate">
                              {repo.owner}/{repo.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {repo.isLocal && (
                              <Badge variant="info" className="h-5 px-1.5 text-[10px] font-semibold bg-accent-primary/20 text-accent-primary border-accent-primary/30">DevPulse</Badge>
                            )}
                            {repo.trending && (
                              <Badge variant={repo.isLocal ? "default" : "success"} className="h-5 px-1.5 text-[10px]">{repo.trending}</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4 line-clamp-2">
                          {repo.description || 'No description provided.'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-text-muted dark:text-text-dark-muted">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5" />
                              {(repo.stars || 0).toLocaleString()}
                            </div>
                            {repo.language && <span>{repo.language}</span>}
                          </div>
                          <a href={repo.url && (repo.url.startsWith('http://') || repo.url.startsWith('https://')) ? repo.url : `https://github.com/${repo.owner}/${repo.name}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </a>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Topics */}
            {activeTab === 'topics' && (
              <motion.div
                key="topics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-accent-primary">
                  <Flame className="w-5 h-5" />
                  <span className="font-medium">Hot Topics</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayTopics.map((topic, index) => (
                    <motion.div
                      key={topic.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card variant="interactive" padding="md">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-text-primary dark:text-white">{topic.name}</h3>
                            <p className="text-sm text-text-muted dark:text-text-dark-muted">{topic.count} repositories</p>
                          </div>
                          <div className="flex items-center gap-1 text-accent-primary text-sm">
                            <TrendingUp className="w-4 h-4" />
                            {topic.growth}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-accent-primary">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Top Developers</span>
                </div>
                <div className="space-y-3">
                  {displayUsers.map((dev, index) => (
                    <motion.div
                      key={dev.username}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card variant="interactive" padding="md">
                        <div className="flex items-center gap-4">
                          {dev.rank && (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-accent-primary">
                              #{dev.rank}
                            </div>
                          )}
                          <img
                            src={dev.avatar}
                            alt={dev.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-accent-primary flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary dark:text-white truncate">{dev.name || dev.username}</p>
                            <p className="text-sm text-text-muted dark:text-text-dark-muted truncate">
                              @{dev.username} • {dev.repositories || dev.publicRepos} repos {dev.contributions !== undefined && `• ${dev.contributions} contributions`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-accent-primary">{dev.score || dev.leaderboardScore}</p>
                            <p className="text-xs text-text-muted dark:text-text-dark-muted">Score</p>
                          </div>
                          <a href={`https://github.com/${dev.username.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              Profile
                            </Button>
                          </a>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
