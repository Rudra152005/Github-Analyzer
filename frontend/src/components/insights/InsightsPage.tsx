import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Code,
  FileText,
  Users,
  Zap,
  CheckCircle,
  ArrowUpRight,
  Play,
  Check,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Badge, Button } from '../ui';
import { api } from '../../lib/api';

interface KeyInsight {
  title: string;
  description: string;
  type: 'strength' | 'improvement' | 'suggestion';
  category: string;
}

interface Section {
  title: string;
  content: string;
}

interface Action {
  priority: 'high' | 'medium' | 'low';
  text: string;
}

interface InsightResult {
  keyInsights: KeyInsight[];
  sections: Section[];
  actions: Action[];
}

const getInsightIcon = (type: string) => {
  if (type === 'strength') return CheckCircle;
  if (type === 'improvement') return AlertTriangle;
  return Lightbulb;
};

const getSectionIcon = (title: string) => {
  if (title === 'Developer Summary') return Users;
  if (title === 'Architecture Review') return Code;
  if (title === 'Documentation Analysis') return FileText;
  return Zap;
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [actionStates, setActionStates] = useState<Record<number, 'not_started' | 'in_progress' | 'completed'>>({});

  const handleActionClick = (index: number) => {
    setActionStates((prev) => {
      const current = prev[index] || 'not_started';
      let next: 'not_started' | 'in_progress' | 'completed';
      if (current === 'not_started') {
        next = 'in_progress';
      } else if (current === 'in_progress') {
        next = 'completed';
      } else {
        next = 'not_started';
      }
      return { ...prev, [index]: next };
    });
  };

  const fetchInsights = async () => {
    try {
      const data = await api.insights.getInsights();
      setInsights(data as unknown as InsightResult);
      setActionStates({});
    } catch (err) {
      console.error('Failed to fetch insights', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRegenerate = async () => {
    setActionStates({});
    setRegenerating(true);
    setStatusMessage('Queueing regeneration job...');
    try {
      const { jobId } = await api.insights.regenerateInsights();
      
      const poll = setInterval(async () => {
        try {
          setStatusMessage('Processing insights with Gemini AI (this may take a few seconds)...');
          const job = await api.insights.getJobStatus(jobId);
          if (job.status === 'completed') {
            clearInterval(poll);
            setInsights(job.result as InsightResult);
            setRegenerating(false);
            setStatusMessage('');
          } else if (job.status === 'failed') {
            clearInterval(poll);
            alert('Regeneration failed: ' + job.error);
            setRegenerating(false);
            setStatusMessage('');
          }
        } catch (err) {
          clearInterval(poll);
          console.error(err);
          setRegenerating(false);
          setStatusMessage('');
        }
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to trigger regeneration');
      setRegenerating(false);
      setStatusMessage('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <Sparkles className="w-7 h-7 text-accent-primary" />
            AI Insights
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            Personalized recommendations powered by AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          {regenerating && (
            <span className="text-xs text-text-muted dark:text-text-dark-muted animate-pulse">
              {statusMessage}
            </span>
          )}
          <Button onClick={handleRegenerate} disabled={regenerating}>
            <Sparkles className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Analyzing...' : 'Regenerate'}
          </Button>
        </div>
      </div>

      {insights && (
        <>
          {/* Key Insights */}
          <div className="grid lg:grid-cols-3 gap-4">
            {insights.keyInsights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="interactive" padding="md" className="h-full">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        insight.type === 'strength'
                          ? 'bg-accent-primary/10'
                          : insight.type === 'improvement'
                            ? 'bg-accent-warning/10'
                            : 'bg-accent-info/10'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          insight.type === 'strength'
                            ? 'text-accent-primary'
                            : insight.type === 'improvement'
                              ? 'text-accent-warning'
                              : 'text-accent-info'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              insight.type === 'strength'
                                ? 'success'
                                : insight.type === 'improvement'
                                  ? 'warning'
                                  : 'info'
                            }
                            size="sm"
                          >
                            {insight.category}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-text-primary dark:text-white mb-1">
                          {insight.title}
                        </h3>
                        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* AI Generated Content Sections */}
          <div className="grid lg:grid-cols-2 gap-6">
            {insights.sections.map((section, index) => {
              const Icon = getSectionIcon(section.title);
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card padding="lg" className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-accent-primary" />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed">
                      {section.content}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Recommended Actions */}
          <Card padding="lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-accent-primary" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {insights.actions.map((action, index) => {
                const status = actionStates[index] || 'not_started';
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-light-surface-secondary dark:bg-dark-card rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        action.priority === 'high'
                          ? 'bg-accent-danger'
                          : action.priority === 'medium'
                            ? 'bg-accent-warning'
                            : 'bg-accent-info'
                      }`} />
                      <span className={`text-sm text-text-primary dark:text-white transition-all duration-200 ${
                        status === 'completed' ? 'line-through opacity-40' : ''
                      }`}>
                        {action.text}
                      </span>
                    </div>
                    {status === 'not_started' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleActionClick(index)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}
                    {status === 'in_progress' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleActionClick(index)}
                        className="text-accent-primary"
                      >
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        In Progress
                      </Button>
                    )}
                    {status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActionClick(index)}
                        className="border-accent-primary/30 text-accent-primary hover:bg-accent-primary/10"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Completed
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
}
