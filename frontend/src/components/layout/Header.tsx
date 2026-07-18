import { Bell, Search, LogOut } from 'lucide-react';
import { Input } from '../ui';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="h-16 bg-light-surface/80 dark:bg-dark-bg-secondary/80 backdrop-blur-xl border-b border-light-border dark:border-dark-border sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Input
            placeholder="Search repositories, users..."
            icon={<Search className="w-4 h-4" />}
            className="bg-light-surface-secondary dark:bg-dark-card border-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-primary rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-light-border dark:border-dark-border">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-accent-primary"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary dark:text-white">{user.name}</p>
            <p className="text-xs text-text-muted dark:text-text-dark-muted">@{user.username}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted dark:text-text-dark-muted hover:text-red-500 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

