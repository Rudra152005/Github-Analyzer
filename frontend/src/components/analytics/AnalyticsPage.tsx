import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  GitCommit,
  GitPullRequest,
  CircleDot,
  MessageSquare,
  Code,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui';
import { api } from '../../lib/api';

export default function AnalyticsPage() {
  const [stats, setStats] = useState([
    { icon: GitCommit, label: 'Commits', value: 0, change: '0%' },
    { icon: GitPullRequest, label: 'Pull Requests', value: 0, change: '0%' },
    { icon: CircleDot, label: 'Issues Closed', value: 0, change: '0%' },
    { icon: MessageSquare, label: 'Reviews', value: 0, change: '0%' },
  ]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [skillData, setSkillData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summary, weekly, skills, growth] = await Promise.all([
          api.user.getAnalyticsSummary(),
          api.user.getAnalyticsWeekly(),
          api.user.getAnalyticsSkills(),
          api.user.getAnalyticsGrowth(),
        ]);

        setStats([
          { icon: GitCommit, label: 'Commits', value: summary.commits, change: summary.commitsChange || '+0%' },
          { icon: GitPullRequest, label: 'Pull Requests', value: summary.prs, change: summary.prsChange || '+0%' },
          { icon: CircleDot, label: 'Issues Closed', value: summary.issues, change: summary.issuesChange || '+0%' },
          { icon: MessageSquare, label: 'Reviews', value: summary.reviews, change: summary.reviewsChange || '+0%' },
        ]);

        setWeeklyData(weekly);

        // Map radar data from { labels: string[], scores: number[] } to { skill: string, value: number }[]
        if (skills) {
          if (Array.isArray(skills)) {
            setSkillData(skills);
          } else if (skills.labels) {
            const mappedSkills = skills.labels.map((label: string, i: number) => ({
              skill: label,
              value: skills.scores[i],
            }));
            setSkillData(mappedSkills);
          }
        }

        setGrowthData(growth);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-white">
          Analytics
        </h1>
        <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
          Deep dive into your GitHub activity and performance
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card variant="default" padding="md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted dark:text-text-dark-muted">{stat.label}</p>
                  <p className="text-xl font-bold text-text-primary dark:text-white">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-accent-primary">{stat.change}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <Card padding="lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-primary" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#58C46B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#58C46B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A313C" opacity={0.3} />
            <XAxis dataKey="week" tick={{ fill: '#8A949E', fontSize: 12 }} axisLine={{ stroke: '#2A313C' }} tickLine={false} />
            <YAxis tick={{ fill: '#8A949E', fontSize: 12 }} axisLine={{ stroke: '#2A313C' }} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1B222C', border: '1px solid #2A313C', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="commits" stroke="#58C46B" fillOpacity={1} fill="url(#colorCommits)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Two column charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contributions by Type */}
        <Card padding="lg">
          <CardHeader className="pb-4">
            <CardTitle>Contributions by Type</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A313C" opacity={0.3} />
              <XAxis dataKey="week" tick={{ fill: '#8A949E', fontSize: 11 }} axisLine={{ stroke: '#2A313C' }} tickLine={false} />
              <YAxis tick={{ fill: '#8A949E', fontSize: 11 }} axisLine={{ stroke: '#2A313C' }} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1B222C', border: '1px solid #2A313C', borderRadius: '8px' }}
              />
              <Bar dataKey="prs" fill="#58C46B" radius={[4, 4, 0, 0]} name="PRs" />
              <Bar dataKey="issues" fill="#F0A63A" radius={[4, 4, 0, 0]} name="Issues" />
              <Bar dataKey="reviews" fill="#8B949E" radius={[4, 4, 0, 0]} name="Reviews" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Skill Radar */}
        <Card padding="lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-accent-primary" />
              Skill Distribution
            </CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={skillData}>
              <PolarGrid stroke="#2A313C" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#8A949E', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#8A949E', fontSize: 10 }} />
              <Radar name="Skills" dataKey="value" stroke="#58C46B" fill="#58C46B" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Growth Metrics */}
      <Card padding="lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-primary" />
            Growth Metrics (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={growthData}>
            <defs>
              <linearGradient id="colorStars" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#58C46B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#58C46B" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B949E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B949E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A313C" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fill: '#8A949E', fontSize: 12 }} axisLine={{ stroke: '#2A313C' }} tickLine={false} />
            <YAxis tick={{ fill: '#8A949E', fontSize: 12 }} axisLine={{ stroke: '#2A313C' }} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1B222C', border: '1px solid #2A313C', borderRadius: '8px' }}
            />
            <Legend formatter={(value) => <span style={{ color: '#8A949E', fontSize: 12 }}>{value}</span>} />
            <Area type="monotone" dataKey="stars" stroke="#58C46B" fillOpacity={1} fill="url(#colorStars)" name="Stars" strokeWidth={2} />
            <Area type="monotone" dataKey="followers" stroke="#8B949E" fillOpacity={1} fill="url(#colorFollowers)" name="Followers" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
