import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GitBranch,
  BarChart3,
  Sparkles,
  Briefcase,
  GitCompare,
  Compass,
  Trophy,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Github,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../ui';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: GitBranch, label: 'Repositories', path: '/repositories' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Sparkles, label: 'AI Insights', path: '/insights' },
  { icon: Briefcase, label: 'Career Analyzer', path: '/career' },
  { icon: GitCompare, label: 'Compare', path: '/compare' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: FileText, label: 'Reports', path: '/reports' },
];

const bottomItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-light-sidebar dark:bg-dark-sidebar border-r border-light-border dark:border-dark-border flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-light-border dark:border-dark-border">
        <motion.div
          className="flex items-center gap-2 overflow-hidden"
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center flex-shrink-0">
            <Github className="w-5 h-5 text-dark-bg" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold text-text-primary dark:text-white whitespace-nowrap"
              >
                DevPulse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                  isActive
                    ? 'bg-accent-primary/10 text-accent-primary'
                    : 'text-text-secondary dark:text-text-dark-secondary hover:bg-light-surface-secondary dark:hover:bg-dark-card hover:text-text-primary dark:hover:text-white'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-accent-primary' : 'group-hover:text-accent-primary'
                )} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-light-border dark:border-dark-border space-y-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-accent-primary/10 text-accent-primary'
                  : 'text-text-secondary dark:text-text-dark-secondary hover:bg-light-surface-secondary dark:hover:bg-dark-card hover:text-text-primary dark:hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}

        <div className="flex items-center gap-2 px-3 py-2">
          <ThemeToggle />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-text-secondary dark:text-text-dark-secondary"
              >
                Theme
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-text-muted dark:text-text-dark-muted hover:text-text-primary dark:hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
