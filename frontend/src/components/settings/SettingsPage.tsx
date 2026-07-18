import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Link,
  Moon,
  Sun,
  Save,
  Linkedin,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Input, Badge, ThemeToggle } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export default function SettingsPage() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [profile, setProfile] = useState({ name: '', bio: '', location: '', company: '', blog: '', twitter: '' });
  const [notifications, setNotifications] = useState({ emailNotifications: true, weeklyReports: true, newInsights: true, careerReminders: true });
  const [privacy, setPrivacy] = useState({ publicProfile: true, showInLeaderboards: true, shareCareerAnalysis: false });
  const [connectedAccounts, setConnectedAccounts] = useState<{
    github: boolean;
    linkedin: boolean;
    linkedinUrl?: string;
  }>({ github: true, linkedin: false, linkedinUrl: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.settings.getSettings();
        setProfile(data.profile);
        setNotifications(data.notifications || {
          emailNotifications: true,
          weeklyReports: true,
          newInsights: true,
          careerReminders: true
        });
        setPrivacy(data.privacy || {
          publicProfile: true,
          showInLeaderboards: true,
          shareCareerAnalysis: false
        });
        if (data.connectedAccounts) {
          setConnectedAccounts(data.connectedAccounts);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.settings.updateProfile(profile);
      alert('Profile settings saved successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile settings');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleNotification = async (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await api.settings.updateNotifications(updated);
    } catch (err) {
      console.error('Failed to update notifications', err);
      setNotifications(notifications); // rollback
    }
  };

  const handleTogglePrivacy = async (key: keyof typeof privacy) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    try {
      await api.settings.updatePrivacy(updated);
    } catch (err) {
      console.error('Failed to update privacy settings', err);
      setPrivacy(privacy); // rollback
    }
  };

  const handleConnectLinkedIn = async () => {
    const url = window.prompt('Enter your LinkedIn Profile URL:', 'https://www.linkedin.com/in/username');
    if (!url) return;
    if (!url.includes('linkedin.com/')) {
      alert('Invalid LinkedIn Profile URL! It must contain "linkedin.com".');
      return;
    }
    try {
      const updated = await api.settings.connectLinkedIn(url);
      setConnectedAccounts(updated);
      alert('LinkedIn account connected successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to connect LinkedIn');
    }
  };

  const handleDisconnectLinkedIn = async () => {
    if (!window.confirm('Are you sure you want to disconnect your LinkedIn account?')) return;
    try {
      const updated = await api.settings.disconnectLinkedIn();
      setConnectedAccounts(updated);
      alert('LinkedIn account disconnected.');
    } catch (err: any) {
      alert(err.message || 'Failed to disconnect LinkedIn');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-accent-primary" />
          Settings
        </h1>
        <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card padding="lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-accent-primary" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-xl object-cover border-2 border-accent-primary flex-shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-text-primary dark:text-white">@{user.username}</p>
              <p className="text-xs text-text-muted dark:text-text-dark-muted mt-1">
                Avatar synced with your public GitHub profile.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2 block">Display Name</label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2 block">Location</label>
              <Input
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2 block">Company</label>
              <Input
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2 block">Website / Blog</label>
              <Input
                value={profile.blog}
                onChange={(e) => setProfile({ ...profile, blog: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2 block">Twitter Username</label>
              <Input
                value={profile.twitter}
                onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2 block">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full h-24 px-3 py-2 rounded-input border bg-light-surface dark:bg-dark-card border-light-border dark:border-dark-border text-text-primary dark:text-white placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>
          <Button onClick={handleSaveProfile} isLoading={savingProfile}>
            <Save className="w-4 h-4 mr-2" />Save Changes
          </Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card padding="lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent-primary" />
            Appearance
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 animate-pulse" /> : <Sun className="w-5 h-5" />}
              <div>
                <p className="font-medium text-text-primary dark:text-white">Theme</p>
                <p className="text-sm text-text-muted dark:text-text-dark-muted">
                  Current: {theme.charAt(0).toUpperCase() + theme.slice(1)} Mode
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card padding="lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates about your analysis' },
            { key: 'weeklyReports', label: 'Weekly Reports', description: 'Get weekly summary of your GitHub activity' },
            { key: 'newInsights', label: 'New Insights', description: 'Be notified when new AI insights are generated' },
            { key: 'careerReminders', label: 'Career Reminders', description: 'Get reminders about skill development goals' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
              <div>
                <p className="font-medium text-text-primary dark:text-white">{item.label}</p>
                <p className="text-sm text-text-muted dark:text-text-dark-muted">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={() => handleToggleNotification(item.key as keyof typeof notifications)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-light-border dark:bg-dark-border rounded-full peer peer-checked:bg-accent-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Connected Accounts */}
      <Card padding="lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-accent-primary" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-text-primary dark:text-white">GitHub</p>
                <p className="text-sm text-text-muted dark:text-text-dark-muted">@{user.username}</p>
              </div>
            </div>
            <Badge variant="success">Connected</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0A66C2] flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-text-primary dark:text-white">LinkedIn</p>
                <p className="text-sm text-text-muted dark:text-text-dark-muted">
                  {connectedAccounts.linkedin && connectedAccounts.linkedinUrl ? (
                    <a href={connectedAccounts.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent-primary">
                      {connectedAccounts.linkedinUrl}
                    </a>
                  ) : (
                    'Not connected'
                  )}
                </p>
              </div>
            </div>
            {connectedAccounts.linkedin ? (
              <div className="flex items-center gap-2">
                <Badge variant="success">Connected</Badge>
                <Button variant="ghost" size="sm" className="text-accent-danger hover:text-red-500" onClick={handleDisconnectLinkedIn}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConnectLinkedIn}
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card padding="lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-primary" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {[
            { key: 'publicProfile', label: 'Public Profile', description: 'Allow others to see your profile' },
            { key: 'showInLeaderboards', label: 'Show in Leaderboards', description: 'Appear in public rankings' },
            { key: 'shareCareerAnalysis', label: 'Share Career Analysis', description: 'Allow sharing analysis reports' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-light-surface-secondary dark:bg-dark-card rounded-lg">
              <div>
                <p className="font-medium text-text-primary dark:text-white">{item.label}</p>
                <p className="text-sm text-text-muted dark:text-text-dark-muted">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy[item.key as keyof typeof privacy]}
                  onChange={() => handleTogglePrivacy(item.key as keyof typeof privacy)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-light-border dark:bg-dark-border rounded-full peer peer-checked:bg-accent-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
