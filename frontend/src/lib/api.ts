import {
  UserProfile,
  Repository,
  ActivityData,
  LanguageStats,
  InsightData,
  LeaderboardEntry,
  Report,
  ComparisonResult,
  CareerAnalysis,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });
  } catch (err: any) {
    if (url.includes('localhost')) {
      throw new Error('Unable to connect to backend server. Please configure VITE_API_URL in your Vercel Environment Variables.');
    }
    throw new Error(`Network Error: Could not connect to API at ${API_BASE}. Please check CORS and server status.`);
  }

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Authentication
  auth: {
    getMe: () => apiFetch<UserProfile>('/auth/me'),
    logout: () => apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }),
    usernameLogin: (username: string) => apiFetch<{ message: string }>('/auth/username-login', { method: 'POST', body: JSON.stringify({ username }) }),
    getGitHubLoginUrl: () => `${API_BASE}/auth/github`,
    getLinkedInLoginUrl: () => `${API_BASE}/auth/linkedin`,
  },

  // Public
  public: {
    getStats: () => apiFetch<{ developers: number; reposAnalyzed: number; satisfaction: number }>('/public/stats'),
    subscribe: (email: string) => apiFetch<{ message: string }>('/public/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  },

  // User & Stats
  user: {
    getProfile: () => apiFetch<UserProfile>('/user/me'),
    getRepos: (params?: { sort?: string; q?: string }) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<Repository[]>(`/user/me/repos${query}`);
    },
    getActivity: () => apiFetch<ActivityData[]>('/user/me/activity'),
    getLanguages: () => apiFetch<LanguageStats[]>('/user/me/languages'),
    getGrowth: () => apiFetch<{ month: string; stars: number; followers: number }[]>('/user/me/growth'),
    getAnalyticsSummary: () => apiFetch<{
      commits: number;
      prs: number;
      issues: number;
      reviews: number;
      commitsChange: string;
      prsChange: string;
      issuesChange: string;
      reviewsChange: string;
    }>('/user/me/analytics/summary'),
    getAnalyticsWeekly: () => apiFetch<{
      week: string;
      commits: number;
      prs: number;
      issues: number;
      reviews: number;
    }[]>('/user/me/analytics/weekly'),
    getAnalyticsSkills: () => apiFetch<{ skill: string; value: number }[] | {
      labels: string[];
      scores: number[];
    }>('/user/me/analytics/skills'),
    getAnalyticsGrowth: () => apiFetch<{
      month: string;
      stars: number;
      followers: number;
    }[]>('/user/me/analytics/growth'),
  },

  // AI Insights
  insights: {
    getInsights: () => apiFetch<{
      keyInsights: { title: string; description: string; type: 'strength' | 'improvement' | 'suggestion'; category: string }[];
      sections: { title: string; content: string }[];
      actions: { priority: 'high' | 'medium' | 'low'; text: string }[];
    }>('/user/me/insights'),
    regenerateInsights: () => apiFetch<{ jobId: string }>('/user/me/insights/regenerate', { method: 'POST' }),
    getJobStatus: (jobId: string) => apiFetch<{
      status: 'pending' | 'processing' | 'completed' | 'failed';
      result?: { keyInsights: InsightData[]; sections: { title: string; content: string }[]; actions: { priority: 'high' | 'medium' | 'low'; text: string }[] } | CareerAnalysis;
      error?: string;
    }>(`/jobs/${jobId}`),
  },

  // Repositories
  repos: {
    getAIReview: (repoId: string) => apiFetch<{ review: NonNullable<Repository['aiReview']> }>(`/repos/${repoId}/ai-review`, {
      method: 'POST',
    }),
  },

  // Career Analyzer
  career: {
    analyzeCareer: (role: string) => apiFetch<CareerAnalysis>(`/user/me/career/analyze`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),
  },

  // Compare
  compare: {
    compareUsers: (user1: string, user2: string) => apiFetch<ComparisonResult>('/compare', {
      method: 'POST',
      body: JSON.stringify({ user1, user2 }),
    }),
    getPublicProfile: (username: string) => apiFetch<UserProfile>(`/github/user/${username}`),
  },

  // Explore
  explore: {
    getTrendingRepos: () => apiFetch<any[]>('/explore/trending-repos'),
    getTrendingTopics: () => apiFetch<string[]>('/explore/trending-topics'),
    getTopUsers: () => apiFetch<any[]>('/explore/top-users'),
    search: (q: string, type: 'repos' | 'topics' | 'users') => apiFetch<any[]>(`/explore/search?q=${q}&type=${type}`),
  },

  // Leaderboard
  leaderboard: {
    getLeaderboard: (timeRange = 'week', category = 'all') =>
      apiFetch<LeaderboardEntry[]>(`/leaderboard?timeRange=${timeRange}&category=${category}`),
  },

  // Reports
  reports: {
    getReports: () => apiFetch<Report[]>('/reports'),
    generateReport: (type: string) => apiFetch<{ reportId: string; status: string }>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),
    getReportById: (reportId: string) => apiFetch<Report>(`/reports/${reportId}`),
    getDownloadReportUrl: (reportId: string) => `${API_BASE}/reports/${reportId}/download`,
    getViewReportUrl: (reportId: string) => `${API_BASE}/reports/${reportId}/download?inline=true`,
    deleteReport: (reportId: string) => apiFetch<{ message: string }>(`/reports/${reportId}`, { method: 'DELETE' }),
  },

  // Settings
  settings: {
    getSettings: () => apiFetch<{
      profile: { name: string; bio: string; location: string; company: string; blog: string; twitter: string };
      notifications: { emailNotifications: boolean; weeklyReports: boolean; newInsights: boolean; careerReminders: boolean };
      privacy: { publicProfile: boolean; showInLeaderboards: boolean; shareCareerAnalysis: boolean };
      connectedAccounts: { github: boolean; linkedin: boolean; linkedinUrl?: string };
    }>('/user/me/settings'),
    updateProfile: (data: any) => apiFetch<any>('/user/me/settings/profile', { method: 'PUT', body: JSON.stringify(data) }),
    updateNotifications: (data: any) => apiFetch<any>('/user/me/settings/notifications', { method: 'PUT', body: JSON.stringify(data) }),
    updatePrivacy: (data: any) => apiFetch<any>('/user/me/settings/privacy', { method: 'PUT', body: JSON.stringify(data) }),
    connectLinkedIn: (linkedinUrl: string) => apiFetch<any>('/user/me/settings/linkedin', { method: 'PUT', body: JSON.stringify({ linkedinUrl }) }),
    disconnectLinkedIn: () => apiFetch<any>('/user/me/settings/linkedin', { method: 'DELETE' }),
  },
};
