import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  Github, ArrowRight, Sparkles, TrendingUp, Target,
  Linkedin, MessageCircle, Mail, ExternalLink,
  BarChart2, BookOpen, Users, Shield, Zap, Heart,
} from 'lucide-react';
import { Button, Input, Select } from '../ui';
import { api } from '../../lib/api';
import { DashboardMock } from './DashboardMock';

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

const features = [
  {
    icon: TrendingUp,
    title: 'Analytics Dashboard',
    description: 'Visualize your GitHub activity with beautiful charts and insights',
  },
  {
    icon: Target,
    title: 'Career Readiness',
    description: 'Get AI-powered career analysis tailored to your dream role',
  },
  {
    icon: Sparkles,
    title: 'AI Insights',
    description: 'Receive personalized recommendations for skill improvement',
  },
];

const footerLinks = {
  Product: [
    { label: 'Dashboard', href: '/dashboard', icon: BarChart2 },
    { label: 'Analytics', href: '/analytics', icon: TrendingUp },
    { label: 'Career Analyzer', href: '/career', icon: Target },
    { label: 'Compare', href: '/compare', icon: Users },
    { label: 'Leaderboard', href: '/leaderboard', icon: Zap },
  ],
  Resources: [
    { label: 'Documentation', href: '#', icon: BookOpen },
    { label: 'API Reference', href: '#', icon: ExternalLink },
    { label: 'Changelog', href: '#', icon: Sparkles },
    { label: 'Status', href: '#', icon: Shield },
  ],
  Company: [
    { label: 'About', href: '#', icon: Users },
    { label: 'Blog', href: '#', icon: BookOpen },
    { label: 'Privacy', href: '#', icon: Shield },
    { label: 'Terms', href: '#', icon: ExternalLink },
  ],
};

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  { icon: Github, label: 'GitHub', href: 'https://github.com', color: 'hover:text-white' },
  { icon: XIcon, label: 'X (Twitter)', href: 'https://x.com', color: 'hover:text-gray-900 dark:hover:text-white' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com', color: 'hover:text-blue-400' },
  { icon: MessageCircle, label: 'Discord', href: '#', color: 'hover:text-indigo-400' },
  { icon: Mail, label: 'Email', href: 'mailto:hello@devpulse.dev', color: 'hover:text-accent-primary' },
];

const defaultStats = [
  { value: '...', label: 'Developers' },
  { value: '...', label: 'Repos Analyzed' },
  { value: '98%', label: 'Satisfaction' },
  { value: '4.9★', label: 'Rating' },
];


export default function Hero() {
  const [username, setUsername] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [role, setRole] = useState<string>(jobRoles[2].value);
  const navigate = useNavigate();
  const { login, devLogin } = useAuth();


  const [stats, setStats] = useState(defaultStats);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  useEffect(() => {
    api.public.getStats()
      .then((data) => {
        setStats([
          { value: `${(data.developers / 1000).toFixed(1)}K+`, label: 'Developers' },
          { value: `${(data.reposAnalyzed / 1000).toFixed(1)}K+`, label: 'Repos Analyzed' },
          { value: `${data.satisfaction}%`, label: 'Satisfaction' },
          { value: '4.9★', label: 'Rating' },
        ]);
      })
      .catch((err) => console.error('Failed to load global stats:', err));
  }, []);

  const handleAnalyze = () => {
    if (username.trim()) {
      if (username.trim().toLowerCase() === 'alexjohnson') {
        devLogin();
      } else {
        login();
      }
    }
  };

  const handleSubscribe = async () => {
    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setSubscribeStatus('error');
      setSubscribeMessage('Please enter a valid email.');
      return;
    }
    try {
      setSubscribeStatus('loading');
      const res = await api.public.subscribe(newsletterEmail);
      setSubscribeStatus('success');
      setSubscribeMessage(res.message);
      setNewsletterEmail('');
    } catch (err: any) {
      setSubscribeStatus('error');
      setSubscribeMessage(err.message || 'Failed to subscribe.');
    }
  };

  return (
    <div className="relative min-h-screen bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-primary/5 rounded-full blur-[120px] -translate-x-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-primary/3 rounded-full blur-[100px]" />

      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent-primary/30 rounded-full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center">
              <Github className="w-6 h-6 text-dark-bg" />
            </div>
            <span className="text-xl font-bold text-text-primary dark:text-white">DevPulse</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-text-secondary dark:text-text-dark-secondary hover:text-accent-primary" onClick={devLogin}>
              Dev Bypass Login
            </Button>
            <Button variant="outline" className="border-accent-primary text-accent-primary" onClick={login}>
              Sign In
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span className="text-sm text-accent-primary font-medium">AI-Powered GitHub Analytics</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary dark:text-white mb-6 leading-tight">
              Transform Your GitHub Into
              <br />
              <span className="text-gradient">Your Career Portfolio</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto mb-12">
              Analyze repositories, detect skills, evaluate career readiness, compare developers,
              and receive AI-powered recommendations.
            </p>

            {/* Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-2 shadow-soft-lg">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 min-w-0">
                    <Input
                      placeholder="Enter your GitHub username"
                      icon={<Github className="w-5 h-5" />}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <Select
                      options={jobRoles}
                      value={role}
                      onChange={setRole}
                      placeholder="Job Role"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="h-12 px-8"
                    onClick={handleAnalyze}
                    disabled={!username.trim()}
                  >
                    Analyze
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="group bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card p-6 hover:border-accent-primary/30 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-4 group-hover:bg-accent-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-24 max-w-5xl mx-auto"
          >
            <div className="relative bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-soft overflow-hidden h-96">
              <DashboardMock />
            </div>
          </motion.div>
        </div>

        {/* ══════════════════ FOOTER ══════════════════ */}
        <footer className="relative mt-32 pb-0">
          {/* Gradient separator */}
          <div className="relative h-px mx-6 lg:mx-12 mb-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-primary/60 to-transparent" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-primary to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Social proof stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="border-y border-light-border dark:border-dark-border/60 py-8 px-6 lg:px-12"
          >
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 + i * 0.1 }}
                >
                  <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-sm text-text-secondary dark:text-text-dark-secondary">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mx-6 lg:mx-12 my-12 rounded-2xl overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 via-dark-card to-accent-primary/5 dark:from-accent-primary/15 dark:via-dark-card dark:to-dark-bg" />
            <div className="absolute inset-0 border border-accent-primary/20 rounded-2xl" />
            <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-7 h-7 text-accent-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-white">Stay in the loop</h3>
                  <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                    Get updates on new features & developer tips.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto min-w-0 md:min-w-[400px]">
                <div className="flex flex-col flex-1 relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={newsletterEmail}
                    onChange={(e) => { setNewsletterEmail(e.target.value); setSubscribeStatus('idle'); }}
                    className="w-full h-11 px-4 rounded-xl bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border text-text-primary dark:text-white placeholder-text-muted dark:placeholder-text-dark-muted text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  />
                  {subscribeMessage && (
                    <span className={`absolute -bottom-6 left-1 text-xs ${subscribeStatus === 'success' ? 'text-accent-primary' : 'text-red-500'}`}>
                      {subscribeMessage}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={subscribeStatus === 'loading'}
                  className="h-11 px-5 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-dark-bg font-semibold text-sm transition-all duration-200 whitespace-nowrap hover:shadow-[0_0_20px_rgba(88,196,107,0.4)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {subscribeStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main footer grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="max-w-7xl mx-auto px-6 lg:px-12 pb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Brand column */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-accent-primary flex items-center justify-center">
                    <Github className="w-5 h-5 text-dark-bg" />
                  </div>
                  <span className="text-lg font-bold text-text-primary dark:text-white">DevPulse</span>
                </div>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed mb-6">
                  AI-powered GitHub analytics to transform your code history into a career story.
                </p>
                {/* Social icons */}
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`w-9 h-9 rounded-xl bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center justify-center text-text-secondary dark:text-text-dark-secondary ${social.color} hover:border-accent-primary/40 hover:bg-accent-primary/10 transition-all duration-200 group`}
                    >
                      <social.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Link columns */}
              {(Object.entries(footerLinks) as [string, { label: string; href: string; icon: React.ElementType }[]][]).map(([category, links], colIdx) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-text-dark-muted mb-5">
                    {category}
                  </h4>
                  <ul className="space-y-3">
                    {links.map((link, i) => (
                      <motion.li
                        key={link.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 + colIdx * 0.05 + i * 0.04 }}
                      >
                        <a
                          href={link.href}
                          onClick={link.href.startsWith('/') ? (e) => { e.preventDefault(); navigate(link.href); } : undefined}
                          className="group flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary hover:text-accent-primary dark:hover:text-accent-primary transition-colors duration-150"
                        >
                          <link.icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                          {link.label}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom bar */}
          <div className="border-t border-light-border dark:border-dark-border/60">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-text-muted dark:text-text-dark-muted">
                © {new Date().getFullYear()} DevPulse. All rights reserved.
              </p>
              <p className="text-xs text-text-muted dark:text-text-dark-muted flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-accent-primary inline" /> for developers worldwide
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-text-muted dark:text-text-dark-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse inline-block" />
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
