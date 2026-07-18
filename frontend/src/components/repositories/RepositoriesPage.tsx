import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Star,
  GitFork,
  Search,
  Grid,
  List,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Users,
  X,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Briefcase
} from 'lucide-react';
import { Card, Button, Input, Skeleton } from '../ui';
import { api } from '../../lib/api';
import { Repository } from '../../types';

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Go: '#00add8',
  Rust: '#dea584',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  C: '#555555',
  'C++': '#f34b7d',
  Kotlin: '#A97BFF',
  Swift: '#ffac45',
  Ruby: '#701516',
};

export default function RepositoriesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'health' | 'complexity' | 'market'>('stars');
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Review States
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [activeReview, setActiveReview] = useState<NonNullable<Repository['aiReview']> | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      const fetchRepos = async () => {
        setLoading(true);
        try {
          const data = await api.user.getRepos({ sort: sortBy, q: search });
          setRepos(data);
        } catch (err) {
          console.error('Failed to fetch repositories', err);
        } finally {
          setLoading(false);
        }
      };
      fetchRepos();
    }, 300);

    return () => clearTimeout(handler);
  }, [sortBy, search]);

  const handleAIReview = async (repo: Repository) => {
    setSelectedRepo(repo);
    setReviewLoading(true);
    setReviewError(null);
    setActiveReview(null);
    try {
      if (repo.aiReview) {
        setActiveReview(repo.aiReview);
        setReviewLoading(false);
        return;
      }
      const res = await api.repos.getAIReview(repo.id);
      setActiveReview(res.review);
      setRepos((prev) =>
        prev.map((r) => (r.id === repo.id ? { ...r, aiReview: res.review } : r))
      );
    } catch (err: any) {
      console.error('AI Review error:', err);
      setReviewError(err.message || 'Failed to generate AI Review. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 71) return '#238636';
    if (score >= 41) return '#D29922';
    return '#F85149';
  };

  const getHealthTextColorClass = (score: number) => {
    if (score >= 71) return 'text-accent-success';
    if (score >= 41) return 'text-accent-warning';
    return 'text-accent-danger';
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">
            Repositories
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            {loading ? 'Analyzing...' : `${repos.length} repositories analyzed`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search repositories..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 px-3 rounded-input border bg-light-surface dark:bg-dark-card border-light-border dark:border-dark-border text-text-primary dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
          >
            <option value="stars">Sort by Stars</option>
            <option value="updated">Sort by Updated</option>
            <option value="health">Sort by Health Score</option>
            <option value="complexity">Sort by Complexity</option>
            <option value="market">Sort by Market Relevance</option>
          </select>
          <div className="flex items-center border border-light-border dark:border-dark-border rounded-input overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`h-10 px-3 flex items-center justify-center transition-colors ${
                view === 'grid'
                  ? 'bg-light-surface-secondary dark:bg-dark-card text-accent-primary'
                  : 'text-text-muted dark:text-text-dark-muted hover:text-text-primary'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`h-10 px-3 flex items-center justify-center transition-colors ${
                view === 'list'
                  ? 'bg-light-surface-secondary dark:bg-dark-card text-accent-primary'
                  : 'text-text-muted dark:text-text-dark-muted hover:text-text-primary'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List View */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]" key="loading">
            <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : repos.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-text-muted select-none" key="empty">
            <GitBranch className="w-12 h-12 mb-3 text-text-muted/40 animate-pulse" />
            <p className="text-base font-semibold">No repositories found</p>
            <p className="text-xs mt-1">Try refining your search terms or filters</p>
          </div>
        ) : view === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {repos.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(0.2, index * 0.02) }}
              >
                <Card variant="interactive" padding="md" className="h-full flex flex-col justify-between">
                  <div>
                    {/* Top bar */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <GitBranch className="w-4 h-4 text-accent-primary flex-shrink-0" />
                        <span className="font-semibold text-text-primary dark:text-white truncate">
                          {repo.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: languageColors[repo.language] || '#8b949e' }}
                        />
                        <span className="text-xs text-text-muted dark:text-text-dark-muted">
                          {repo.language || 'Plain Text'}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary line-clamp-2 mb-4 h-10">
                      {repo.description || 'No description provided.'}
                    </p>

                    {/* Progress details (Complexity / Market Fit) */}
                    <div className="flex flex-col gap-2.5 mb-4 text-xs">
                      {/* Complexity */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-text-secondary dark:text-text-dark-secondary">
                          <div className="relative group">
                            <span className="text-text-muted dark:text-text-dark-muted cursor-help border-b border-dashed border-text-muted/30 select-none">
                              Complexity
                            </span>
                            <div className="absolute z-50 bottom-full left-0 mb-1 hidden group-hover:block w-56 p-2 bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border text-[10px] text-text-secondary dark:text-text-dark-secondary rounded shadow-xl leading-normal">
                              Evaluates primary language complexity baseline, active code size, and structure.
                            </div>
                          </div>
                          <span className={`font-semibold ${getHealthTextColorClass(repo.complexityScore)}`}>
                            {repo.complexityScore}%
                          </span>
                        </div>
                        <div className="w-full h-1 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${repo.complexityScore}%`,
                              backgroundColor: getHealthColor(repo.complexityScore) 
                            }} 
                          />
                        </div>
                      </div>

                      {/* Market Fit */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-text-secondary dark:text-text-dark-secondary">
                          <div className="relative group">
                            <span className="text-text-muted dark:text-text-dark-muted cursor-help border-b border-dashed border-text-muted/30 select-none">
                              Market Fit
                            </span>
                            <div className="absolute z-50 bottom-full left-0 mb-1 hidden group-hover:block w-56 p-2 bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border text-[10px] text-text-secondary dark:text-text-dark-secondary rounded shadow-xl leading-normal">
                              Measures primary language demand, stars/forks activity, and trending topics matching.
                            </div>
                          </div>
                          <span className={`font-semibold ${getHealthTextColorClass(repo.marketRelevance)}`}>
                            {repo.marketRelevance}%
                          </span>
                        </div>
                        <div className="w-full h-1 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${repo.marketRelevance}%`,
                              backgroundColor: getHealthColor(repo.marketRelevance) 
                            }} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stats List */}
                    <div className="flex items-center gap-4 text-xs text-text-muted dark:text-text-dark-muted mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" />
                        {repo.stars.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5" />
                        {repo.forks}
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {repo.issues}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {repo.contributors}
                      </div>
                    </div>
                  </div>

                  {/* Card Action footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-light-border dark:border-dark-border mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${repo.healthScore}%` }}
                          transition={{ delay: 0.1 }}
                          style={{ backgroundColor: getHealthColor(repo.healthScore) }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${getHealthTextColorClass(repo.healthScore)}`}>
                        {repo.healthScore}%
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleAIReview(repo)}>
                      <Sparkles className="w-3 h-3 mr-1 text-accent-primary" />
                      AI Review
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {repos.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(0.2, index * 0.02) }}
              >
                <Card variant="interactive" padding="md" className="cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                        <GitBranch className="w-5 h-5 text-accent-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text-primary dark:text-white">
                            {repo.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: languageColors[repo.language] || '#8b949e' }}
                            />
                            <span className="text-xs text-text-muted dark:text-text-dark-muted">
                              {repo.language || 'Plain Text'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary dark:text-text-dark-secondary truncate">
                          {repo.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                      {/* Metric percentages */}
                      <div className="flex flex-col items-end text-xs mr-2 text-text-secondary dark:text-text-dark-secondary gap-1 select-none">
                        <div className="relative group">
                          <span className="cursor-help border-b border-dashed border-text-muted/30">
                            Complexity: <span className="font-semibold text-accent-primary">{repo.complexityScore}%</span>
                          </span>
                          <div className="absolute z-50 bottom-full right-0 mb-1 hidden group-hover:block w-56 p-2 bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border text-[10px] text-text-secondary dark:text-text-dark-secondary rounded shadow-xl leading-normal whitespace-normal">
                            Calculated from primary language complexity baseline, active code size, and structure.
                          </div>
                        </div>
                        <div className="relative group">
                          <span className="cursor-help border-b border-dashed border-text-muted/30">
                            Market Fit: <span className="font-semibold text-accent-primary">{repo.marketRelevance}%</span>
                          </span>
                          <div className="absolute z-50 bottom-full right-0 mb-1 hidden group-hover:block w-56 p-2 bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border text-[10px] text-text-secondary dark:text-text-dark-secondary rounded shadow-xl leading-normal whitespace-normal">
                            Calculated from primary language demand, stars/forks activity, and trending topics matching.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-text-muted dark:text-text-dark-muted">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {repo.stars.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-4 h-4" />
                          {repo.forks}
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {repo.issues}
                        </div>
                      </div>

                      {/* Health score fill bar */}
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${repo.healthScore}%` }}
                            style={{ backgroundColor: getHealthColor(repo.healthScore) }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${getHealthTextColorClass(repo.healthScore)} w-8`}>
                          {repo.healthScore}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => handleAIReview(repo)}>
                          <Sparkles className="w-4 h-4 text-accent-primary" />
                        </Button>
                        <a href={repo.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Review Modal Overlay */}
      <AnimatePresence>
        {selectedRepo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRepo(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl shadow-2xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border bg-light-surface-secondary dark:bg-dark-card-header/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-primary animate-pulse" />
                  <div>
                    <h3 className="font-semibold text-text-primary dark:text-white leading-none">
                      AI Codebase Review
                    </h3>
                    <p className="text-[11px] text-text-muted dark:text-text-dark-muted mt-1.5">
                      Analyzing {selectedRepo.fullName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRepo(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary dark:hover:text-white hover:bg-light-border dark:hover:bg-dark-border transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5">
                {reviewLoading ? (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Skeleton variant="circular" width={20} height={20} className="flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton variant="text" width="25%" />
                        <Skeleton variant="text" width="90%" />
                        <Skeleton variant="text" width="80%" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Skeleton variant="circular" width={20} height={20} className="flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton variant="text" width="25%" />
                        <Skeleton variant="text" width="85%" />
                        <Skeleton variant="text" width="70%" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Skeleton variant="circular" width={20} height={20} className="flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton variant="text" width="30%" />
                        <Skeleton variant="text" width="92%" />
                        <Skeleton variant="text" width="88%" />
                      </div>
                    </div>
                  </div>
                ) : reviewError ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <AlertCircle className="w-12 h-12 text-accent-danger mb-3" />
                    <p className="font-semibold text-text-primary dark:text-white">AI Analysis Failed</p>
                    <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1.5 max-w-sm">
                      {reviewError}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => handleAIReview(selectedRepo)}>
                      Try Again
                    </Button>
                  </div>
                ) : activeReview ? (
                  <div className="space-y-5 text-sm">
                    {/* Strengths */}
                    {activeReview.strengths?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-accent-success flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <CheckCircle className="w-4 h-4" />
                          Key Strengths
                        </h4>
                        <ul className="space-y-1.5 pl-6 list-disc text-text-secondary dark:text-text-dark-secondary leading-relaxed">
                          {activeReview.strengths.map((str, i) => (
                            <li key={i}>{str}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {activeReview.weaknesses?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-accent-danger flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1.5 pl-6 list-disc text-text-secondary dark:text-text-dark-secondary leading-relaxed">
                          {activeReview.weaknesses.map((weak, i) => (
                            <li key={i}>{weak}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {activeReview.suggestions?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-accent-warning flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <Lightbulb className="w-4 h-4" />
                          Actionable Recommendations
                        </h4>
                        <ul className="space-y-1.5 pl-6 list-disc text-text-secondary dark:text-text-dark-secondary leading-relaxed">
                          {activeReview.suggestions.map((sug, i) => (
                            <li key={i}>{sug}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Portfolio / Career Readiness Value */}
                    {activeReview.valueAssessment && (
                      <div className="p-4 bg-light-surface-secondary dark:bg-dark-border/40 rounded-lg border border-light-border dark:border-dark-border/60">
                        <h4 className="font-semibold text-accent-primary flex items-center gap-1.5 text-xs uppercase tracking-wider mb-2">
                          <Briefcase className="w-4 h-4" />
                          Portfolio Value Assessment
                        </h4>
                        <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed italic">
                          "{activeReview.valueAssessment}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-surface-secondary dark:bg-dark-card-header/30">
                <Button size="sm" onClick={() => setSelectedRepo(null)}>
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
