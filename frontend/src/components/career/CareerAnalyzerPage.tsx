import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Target,
  AlertTriangle,
  CheckCircle,
  Award,
  BookOpen,
  Lightbulb,
  Star,
  ChevronRight,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Badge, Button, Select, Progress } from '../ui';
import { api } from '../../lib/api';
import { CareerAnalysis } from '../../types';

const jobRoles: { value: string; label: string }[] = [
  { value: 'Frontend Developer', label: 'Frontend Developer' },
  { value: 'Backend Developer', label: 'Backend Developer' },
  { value: 'Full Stack Developer', label: 'Full Stack Developer' },
  { value: 'AI Engineer', label: 'AI Engineer' },
  { value: 'ML Engineer', label: 'ML Engineer' },
  { value: 'DevOps Engineer', label: 'DevOps Engineer' },
  { value: 'Cloud Engineer', label: 'Cloud Engineer' },
  { value: 'Cybersecurity Engineer', label: 'Cybersecurity Engineer' },
  { value: 'Data Scientist', label: 'Data Scientist' },
  { value: 'Mobile Developer', label: 'Mobile Developer' },
];

/** Skeleton shimmer used while the request is in flight */
function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-dark-border/40 animate-pulse ${className}`} />
  );
}

function ScoreSkeleton() {
  return (
    <Card padding="lg">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <SkeletonBlock className="w-40 h-40 rounded-full" />
          <SkeletonBlock className="w-28 h-6" />
        </div>
        <div className="flex-1 grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-light-surface-secondary dark:bg-dark-card rounded-lg space-y-3">
              <SkeletonBlock className="w-32 h-4" />
              <SkeletonBlock className="w-full h-3" />
              <SkeletonBlock className="w-4/5 h-3" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function CareerAnalyzerPage() {
  const [selectedRole, setSelectedRole] = useState<string>('Full Stack Developer');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Clear stale analysis whenever the role changes */
  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setAnalysis(null);
    setHasAnalyzed(false);
    setError(null);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);      // clear stale data immediately
    setHasAnalyzed(false);
    try {
      const data = await api.career.analyzeCareer(selectedRole);
      setAnalysis(data);
      setHasAnalyzed(true);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze career readiness. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const roleMatchVariant = (match?: string): 'success' | 'warning' | 'danger' => {
    if (match === 'Strong match') return 'success';
    if (match === 'Partial match') return 'warning';
    return 'danger';
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
          <h1 className="text-2xl font-bold text-text-primary dark:text-white flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-accent-primary" />
            Career Analyzer
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            Assess your readiness for your dream role
          </p>
        </div>
      </div>

      {/* Role Selection */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 max-w-md">
            <label className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2 block">
              Target Role
            </label>
            <Select
              options={jobRoles}
              value={selectedRole}
              onChange={handleRoleChange}
              placeholder="Select a role..."
            />
          </div>
          <Button onClick={handleAnalyze} isLoading={isAnalyzing} disabled={isAnalyzing}>
            <Target className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Career Readiness'}
          </Button>
        </div>
        {/* Hint */}
        {!hasAnalyzed && !isAnalyzing && (
          <p className="text-xs text-text-muted dark:text-text-dark-muted mt-3">
            Analysis fetches your real GitHub repositories and evaluates them against the selected role using AI.
          </p>
        )}
      </Card>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-4 bg-accent-danger/10 border border-accent-danger/30 rounded-xl"
          >
            <AlertTriangle className="w-5 h-5 text-accent-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-accent-danger">Analysis failed</p>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleAnalyze}>
              <RefreshCw className="w-4 h-4 mr-1" /> Retry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <ScoreSkeleton />
            <div className="grid lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} padding="md">
                  <div className="space-y-3">
                    <SkeletonBlock className="w-40 h-4" />
                    <SkeletonBlock className="w-full h-3" />
                    <SkeletonBlock className="w-3/4 h-3" />
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">
        {hasAnalyzed && !isAnalyzing && analysis && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Career Score Overview */}
            <Card padding="lg">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Score Circle */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="72"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-light-border dark:text-dark-border"
                      />
                      <motion.circle
                        cx="80"
                        cy="80"
                        r="72"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className="text-accent-primary"
                        initial={{ strokeDasharray: '0 452' }}
                        animate={{ strokeDasharray: `${(analysis.score / 100) * 452} 452` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        className="text-4xl font-bold text-text-primary dark:text-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {analysis.score}
                      </motion.span>
                      <span className="text-sm text-text-muted dark:text-text-dark-muted">Career Score</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 mt-4">
                    <Badge variant={analysis.score >= 75 ? 'success' : analysis.score >= 50 ? 'warning' : 'danger'}>
                      {analysis.score >= 75 ? 'Interview Ready' : analysis.score >= 50 ? 'Developing' : 'Requires Growth'}
                    </Badge>
                    {analysis.roleMatch && (
                      <Badge variant={roleMatchVariant(analysis.roleMatch)} size="sm">
                        {analysis.roleMatch}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-1 grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-accent-primary" />
                      <span className="text-sm font-medium text-text-primary dark:text-white">Strengths</span>
                    </div>
                    <ul className="space-y-2">
                      {analysis.strengths.slice(0, 3).map((strength, i) => (
                        <li key={i} className="text-xs text-text-secondary dark:text-text-dark-secondary flex items-start gap-2">
                          <div className="w-1 h-1 bg-accent-primary rounded-full mt-1.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-accent-warning" />
                      <span className="text-sm font-medium text-text-primary dark:text-white">Areas to Improve</span>
                    </div>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, i) => (
                        <li key={i} className="text-xs text-text-secondary dark:text-text-dark-secondary flex items-start gap-2">
                          <div className="w-1 h-1 bg-accent-warning rounded-full mt-1.5 flex-shrink-0" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-accent-info" />
                      <span className="text-sm font-medium text-text-primary dark:text-white">Interview Readiness</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.interviewReadiness} className="flex-1" />
                      <span className="text-sm font-medium text-text-primary dark:text-white">
                        {analysis.interviewReadiness}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-accent-primary" />
                      <span className="text-sm font-medium text-text-primary dark:text-white">Role Match</span>
                    </div>
                    <div className="text-2xl font-bold text-accent-primary">{analysis.score}%</div>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted mt-1">
                      {analysis.roleMatch ?? (
                        analysis.score >= 80 ? 'Strong candidate' : analysis.score >= 60 ? 'Potential candidate' : 'Needs development'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Missing Skills */}
            {analysis.missingSkills.length > 0 && (
              <Card padding="lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent-primary" />
                    Missing Skills for {selectedRole}
                  </CardTitle>
                </CardHeader>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill) => (
                    <Badge key={skill} variant="warning">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Learning Roadmap */}
            {analysis.learningRoadmap.length > 0 && (
              <Card padding="lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent-primary" />
                    Learning Roadmap
                  </CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  {analysis.learningRoadmap.map((step, index) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-light-border dark:border-dark-border rounded-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          step.priority === 'high'
                            ? 'bg-accent-danger/10 text-accent-danger'
                            : step.priority === 'medium'
                              ? 'bg-accent-warning/10 text-accent-warning'
                              : 'bg-accent-info/10 text-accent-info'
                        }`}>
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-text-primary dark:text-white">
                              {step.title}
                            </h3>
                            <Badge
                              variant={
                                step.priority === 'high'
                                  ? 'danger'
                                  : step.priority === 'medium'
                                    ? 'warning'
                                    : 'info'
                              }
                              size="sm"
                            >
                              {step.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2">
                            {step.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-xs text-text-muted dark:text-text-dark-muted">
                              <Clock className="w-3 h-3" />
                              {step.estimatedTime}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {step.resources.slice(0, 3).map((resource) => (
                                <Badge key={resource} variant="outline" size="sm">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recommendations Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recommended Projects */}
              {analysis.recommendedProjects.length > 0 && (
                <Card padding="md">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-accent-primary" />
                      Recommended Projects
                    </CardTitle>
                  </CardHeader>
                  <ul className="space-y-2">
                    {analysis.recommendedProjects.map((project, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                        <div className="w-1.5 h-1.5 bg-accent-primary rounded-full mt-1.5 flex-shrink-0" />
                        {project}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Recommended Certifications */}
              {analysis.recommendedCertifications.length > 0 && (
                <Card padding="md">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-accent-primary" />
                      Recommended Certifications
                    </CardTitle>
                  </CardHeader>
                  <ul className="space-y-2">
                    {analysis.recommendedCertifications.map((cert, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                        <div className="w-1.5 h-1.5 bg-accent-primary rounded-full flex-shrink-0" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Resume Feedback */}
              {analysis.resumeFeedback && (
                <Card padding="md">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <FileIcon className="w-5 h-5 text-accent-primary" />
                      Resume Feedback
                    </CardTitle>
                  </CardHeader>
                  <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                    {analysis.resumeFeedback}
                  </p>
                </Card>
              )}

              {/* Portfolio Suggestions */}
              {analysis.portfolioSuggestions.length > 0 && (
                <Card padding="md">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-accent-primary" />
                      Portfolio Suggestions
                    </CardTitle>
                  </CardHeader>
                  <ul className="space-y-2">
                    {analysis.portfolioSuggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                        <div className="w-1.5 h-1.5 bg-accent-primary rounded-full mt-1.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
