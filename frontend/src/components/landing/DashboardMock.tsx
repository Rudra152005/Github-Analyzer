import { GitBranch, Star, GitFork, Users, Flame } from 'lucide-react';

export function DashboardMock() {
  const stats = [
    { icon: GitBranch, label: 'Repositories', value: '42', change: '+3 this month' },
    { icon: Star, label: 'Stars Earned', value: '1,204', change: '+127 this month' },
    { icon: GitFork, label: 'Total Forks', value: '348', change: '+34 this month' },
    { icon: Users, label: 'Followers', value: '892', change: '+89 this month' },
  ];

  const topRepos = [
    { name: 'react-dashboard', language: 'TypeScript', health: '98%', complexity: '65%', marketFit: '92%' },
    { name: 'api-gateway', language: 'Go', health: '94%', complexity: '78%', marketFit: '88%' },
    { name: 'machine-learning-ops', language: 'Python', health: '91%', complexity: '85%', marketFit: '95%' },
  ];

  return (
    <div className="bg-light-bg dark:bg-dark-bg w-full h-full p-6 select-none overflow-hidden text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-text-primary dark:text-white">Dashboard</h2>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">Welcome back, Alex</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-primary/10 border border-accent-primary/20">
          <Flame className="w-4 h-4 text-accent-primary" />
          <span className="text-sm font-medium text-accent-primary">14 day streak</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">{stat.label}</p>
                <p className="text-xl font-bold text-text-primary dark:text-white mt-1">{stat.value}</p>
                <p className="text-[10px] text-accent-primary mt-1">{stat.change}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-accent-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card Mock */}
        <div className="bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-blue-500" />
            <div>
              <h3 className="text-sm font-semibold text-text-primary dark:text-white">Alex Johnson</h3>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary">@alexjohnson</p>
            </div>
          </div>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary line-clamp-2 mb-4">
            Full-stack developer passionate about open source and building scalable applications.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center border-t border-light-border dark:border-dark-border pt-4">
            <div>
              <p className="text-sm font-bold text-text-primary dark:text-white">842</p>
              <p className="text-[10px] text-text-muted dark:text-text-dark-muted">Commits</p>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary dark:text-white">124</p>
              <p className="text-[10px] text-text-muted dark:text-text-dark-muted">PRs</p>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary dark:text-white">56</p>
              <p className="text-[10px] text-text-muted dark:text-text-dark-muted">Issues</p>
            </div>
          </div>
        </div>

        {/* Repositories List Mock */}
        <div className="md:col-span-2 bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary dark:text-white">Top Repositories</h3>
          </div>
          <div className="space-y-3">
            {topRepos.map((repo, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-light-surface-secondary dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border/50">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                    <GitBranch className="w-4 h-4 text-accent-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary dark:text-white">{repo.name}</p>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted">{repo.language}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex flex-col items-end text-text-secondary dark:text-text-dark-secondary">
                    <span>Complexity: <span className="text-accent-primary font-medium">{repo.complexity}</span></span>
                    <span>Market Fit: <span className="text-accent-primary font-medium">{repo.marketFit}</span></span>
                  </div>
                  <div className="px-2 py-1 rounded bg-green-500/20 text-green-500 font-medium">
                    Health: {repo.health}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fade out bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-light-surface dark:from-dark-card to-transparent" />
    </div>
  );
}
