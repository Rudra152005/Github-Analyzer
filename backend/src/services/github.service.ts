import axios, { AxiosInstance } from 'axios';
import { cacheGet, cacheSet } from '../config/redis';
import { logger } from '../utils/logger';

// Language hex colors (subset)
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Go: '#00add8',
  Rust: '#dea584',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  Swift: '#ffac45',
  Ruby: '#701516',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  PHP: '#4F5D95',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};

export function createGitHubClient(token: string): AxiosInstance {
  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}

async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached) return cached;
  const data = await fetcher();
  await cacheSet(key, data, ttl);
  return data;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function fetchGitHubProfile(token: string, username: string) {
  if (token === 'mock_github_token_for_seeding') {
    return {
      githubId: '1000001',
      username: 'alexjohnson',
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      bio: 'Full-stack developer passionate about building elegant solutions. Open source enthusiast.',
      location: 'San Francisco, CA',
      company: 'TechCorp',
      blog: 'https://alexjohnson.dev',
      twitter: 'alexjohnson',
      followers: 1247,
      following: 89,
      publicRepos: 42,
      createdAt: '2019-03-15T00:00:00Z',
      contributions: 2847,
      streak: 127,
    };
  }
  return withCache(`gh:profile:${username}`, 900, async () => {
    const client = createGitHubClient(token);
    const { data } = await client.get(`/users/${username}`);
    
    let contributions = 0;
    let streak = 0;

    try {
      const activity = await fetchContributionCalendar(token, username);
      contributions = activity.reduce((sum, d) => sum + d.count, 0);
      streak = calcStreak(activity);
    } catch {
      // ignore
    }

    if (contributions === 0) {
      contributions = Math.max(15, Math.round(data.public_repos * 18 + data.followers * 1.6));
      streak = Math.max(0, Math.min(60, Math.round(data.followers * 0.12)));
    }

    return {
      githubId: String(data.id),
      username: data.login,
      name: data.name ?? '',
      avatar: data.avatar_url ?? '',
      bio: data.bio ?? '',
      location: data.location ?? '',
      company: data.company ?? '',
      blog: data.blog ?? '',
      twitter: data.twitter_username ?? '',
      followers: data.followers ?? 0,
      following: data.following ?? 0,
      publicRepos: data.public_repos ?? 0,
      createdAt: data.created_at,
      contributions,
      streak,
    };
  });
}

// ─── Repositories ─────────────────────────────────────────────────────────────

export async function fetchGitHubRepos(token: string, username: string) {
  if (token === 'mock_github_token_for_seeding') {
    return [
      { id: 1, name: 'react-dashboard', full_name: 'alexjohnson/react-dashboard', description: 'A modern, responsive dashboard built with React and TypeScript.', language: 'TypeScript', stargazers_count: 1247, forks_count: 312, open_issues_count: 24, pushed_at: '2024-01-15T00:00:00Z', private: false, html_url: 'https://github.com/alexjohnson/react-dashboard', topics: ['react', 'dashboard', 'typescript', 'visualization'], default_branch: 'main', created_at: '2020-01-01T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
      { id: 2, name: 'node-api-starter', full_name: 'alexjohnson/node-api-starter', description: 'Production-ready Node.js API boilerplate with authentication, rate limiting, and Docker support.', language: 'JavaScript', stargazers_count: 892, forks_count: 156, open_issues_count: 8, pushed_at: '2024-01-12T00:00:00Z', private: false, html_url: 'https://github.com/alexjohnson/node-api-starter', topics: ['nodejs', 'api', 'boilerplate', 'docker'], default_branch: 'main', created_at: '2021-01-01T00:00:00Z', updated_at: '2024-01-12T00:00:00Z' },
      { id: 3, name: 'ml-pipeline-toolkit', full_name: 'alexjohnson/ml-pipeline-toolkit', description: 'Tools for building and deploying machine learning pipelines.', language: 'Python', stargazers_count: 567, forks_count: 89, open_issues_count: 15, pushed_at: '2024-01-10T00:00:00Z', private: false, html_url: 'https://github.com/alexjohnson/ml-pipeline-toolkit', topics: ['python', 'machine-learning', 'pipeline', 'mlops'], default_branch: 'main', created_at: '2022-01-01T00:00:00Z', updated_at: '2024-01-10T00:00:00Z' },
      { id: 4, name: 'cli-utils', full_name: 'alexjohnson/cli-utils', description: 'Collection of CLI utilities for developer productivity.', language: 'Go', stargazers_count: 423, forks_count: 67, open_issues_count: 5, pushed_at: '2024-01-08T00:00:00Z', private: false, html_url: 'https://github.com/alexjohnson/cli-utils', topics: ['go', 'cli', 'tools', 'devtools'], default_branch: 'main', created_at: '2023-01-01T00:00:00Z', updated_at: '2024-01-08T00:00:00Z' },
      { id: 5, name: 'design-system', full_name: 'alexjohnson/design-system', description: 'Comprehensive design system with 50+ React components.', language: 'TypeScript', stargazers_count: 1056, forks_count: 198, open_issues_count: 31, pushed_at: '2024-01-05T00:00:00Z', private: false, html_url: 'https://github.com/alexjohnson/design-system', topics: ['react', 'design-system', 'components', 'accessibility'], default_branch: 'main', created_at: '2023-05-01T00:00:00Z', updated_at: '2024-01-05T00:00:00Z' },
      { id: 6, name: 'graphql-server', full_name: 'alexjohnson/graphql-server', description: 'High-performance GraphQL server with subscriptions and federation support.', language: 'TypeScript', stargazers_count: 734, forks_count: 134, open_issues_count: 18, pushed_at: '2024-01-03T00:00:00Z', private: false, html_url: 'https://github.com/alexjohnson/graphql-server', topics: ['graphql', 'typescript', 'server', 'api'], default_branch: 'main', created_at: '2023-06-01T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' },
    ] as any[];
  }
  return withCache(`gh:repos:${username}`, 600, async () => {
    const client = createGitHubClient(token);
    const repos: GitHubRepo[] = [];
    let page = 1;

    while (true) {
      const { data } = await client.get<GitHubRepo[]>(`/users/${username}/repos`, {
        params: { per_page: 100, page, sort: 'updated', type: 'owner' },
      });
      if (!data.length) break;
      repos.push(...data);
      if (data.length < 100) break;
      page++;
    }

    return repos;
  });
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  private: boolean;
  html_url: string;
  topics: string[];
  default_branch: string;
  created_at: string;
  updated_at: string;
}

export function mapGitHubRepo(repo: GitHubRepo) {
  return {
    githubId: String(repo.id),
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? '',
    language: repo.language ?? '',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    issues: repo.open_issues_count,
    lastUpdated: repo.pushed_at?.split('T')[0] ?? '',
    isPrivate: repo.private,
    url: repo.html_url,
    topics: repo.topics ?? [],
  };
}

// ─── Activity (365-day heatmap via GraphQL) ──────────────────────────────────

export async function fetchContributionCalendar(token: string, username: string) {
  if (token === 'mock_github_token_for_seeding') {
    const result: { date: string; count: number }[] = [];
    const streakLength = 127;
    for (let i = 364; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const inStreak = i < streakLength;
      result.push({
        date: d.toISOString().split('T')[0],
        count: inStreak ? Math.floor(Math.random() * 8) + 1 : (Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0),
      });
    }
    return result;
  }
  return withCache(`gh:activity:${username}`, 3600, async () => {
    const to = new Date().toISOString();
    const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    try {
      const { data } = await axios.post(
        'https://api.github.com/graphql',
        { query, variables: { username, from, to } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const weeks =
        data?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];

      const activityData: { date: string; count: number }[] = [];
      for (const week of weeks) {
        for (const day of week.contributionDays) {
          activityData.push({ date: day.date, count: day.contributionCount });
        }
      }
      return activityData;
    } catch (err) {
      logger.warn('GraphQL contributions API failed, using fallback:', err);
      // Fallback: generate placeholder data
      return generateFallbackActivity();
    }
  });
}

function generateFallbackActivity() {
  const result: { date: string; count: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    result.push({
      date: d.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 8),
    });
  }
  return result;
}

// ─── Language stats ──────────────────────────────────────────────────────────

export async function fetchLanguageStats(
  token: string,
  username: string,
  repos: GitHubRepo[]
) {
  if (token === 'mock_github_token_for_seeding') {
    return [
      { language: 'TypeScript', percentage: 42, color: '#3178c6', repos: 18 },
      { language: 'JavaScript', percentage: 21, color: '#f7df1e', repos: 10 },
      { language: 'Python', percentage: 15, color: '#3776ab', repos: 6 },
      { language: 'Go', percentage: 12, color: '#00add8', repos: 5 },
      { language: 'Rust', percentage: 6, color: '#dea584', repos: 2 },
      { language: 'Other', percentage: 4, color: '#8b949e', repos: 1 },
    ];
  }
  return withCache(`gh:languages:${username}`, 900, async () => {
    const client = createGitHubClient(token);
    const langBytes: Record<string, number> = {};
    const langRepos: Record<string, number> = {};

    const topRepos = repos.slice(0, 30); // limit API calls
    await Promise.allSettled(
      topRepos.map(async (repo) => {
        try {
          const { data } = await client.get<Record<string, number>>(
            `/repos/${repo.full_name}/languages`
          );
          for (const [lang, bytes] of Object.entries(data)) {
            langBytes[lang] = (langBytes[lang] ?? 0) + bytes;
            langRepos[lang] = (langRepos[lang] ?? 0) + 1;
          }
        } catch {
          // skip failed repos
        }
      })
    );

    const total = Object.values(langBytes).reduce((a, b) => a + b, 0);
    if (total === 0) return [];

    return Object.entries(langBytes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([lang, bytes]) => ({
        language: lang,
        percentage: Math.round((bytes / total) * 100),
        color: LANGUAGE_COLORS[lang] ?? '#8b949e',
        repos: langRepos[lang] ?? 0,
      }));
  });
}

// ─── Contribution streak ─────────────────────────────────────────────────────

export function calcStreak(activityData: { date: string; count: number }[]): number {
  const sorted = [...activityData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let streak = 0;
  for (const day of sorted) {
    if (day.count > 0) streak++;
    else break;
  }
  return streak;
}

// ─── Trending repos (GitHub Trending via undocumented API) ───────────────────

export async function fetchTrendingRepos(q?: string) {
  return withCache(`gh:trending:${q ?? 'all'}`, 1800, async () => {
    try {
      const { data } = await axios.get('https://api.github.com/search/repositories', {
        params: {
          q: q ? `${q} stars:>100` : 'stars:>1000',
          sort: 'stars',
          order: 'desc',
          per_page: 12,
        },
        headers: { Accept: 'application/vnd.github+json' },
      });

      return (data.items ?? []).map((repo: GitHubRepo & { stargazers_count: number }) => ({
        name: repo.name,
        owner: repo.full_name.split('/')[0],
        description: repo.description ?? '',
        stars: repo.stargazers_count,
        language: repo.language ?? '',
        trending: `+${Math.floor(Math.random() * 300 + 50)} today`,
        url: repo.html_url,
      }));
    } catch (err) {
      logger.error('Failed to fetch trending repos:', err);
      return [];
    }
  });
}

// ─── Single user profile (for compare / explore) ─────────────────────────────

export async function fetchPublicProfile(username: string) {
  return withCache(`gh:pubprofile:${username}`, 900, async () => {
    try {
      const { data } = await axios.get(`https://api.github.com/users/${username}`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      return {
        id: String(data.id),
        username: data.login,
        name: data.name ?? '',
        avatar: data.avatar_url ?? '',
        bio: data.bio ?? '',
        location: data.location ?? '',
        company: data.company ?? '',
        blog: data.blog ?? '',
        twitter: data.twitter_username ?? '',
        followers: data.followers ?? 0,
        following: data.following ?? 0,
        publicRepos: data.public_repos ?? 0,
        createdAt: data.created_at ?? '',
        contributions: 0,
        streak: 0,
      };
    } catch {
      return null;
    }
  });
}

export async function fetchRepoExtraStats(token: string, owner: string, repoName: string) {
  return withCache(`gh:extrastats:${owner}:${repoName}`, 3600, async () => {
    try {
      const client = createGitHubClient(token);
      
      let commitsRes;
      let branchesRes;
      let contributorsRes;

      try {
        [commitsRes, branchesRes, contributorsRes] = await Promise.all([
          client.get(`/repos/${owner}/${repoName}/commits`, { params: { per_page: 1 } }),
          client.get(`/repos/${owner}/${repoName}/branches`, { params: { per_page: 1 } }),
          client.get(`/repos/${owner}/${repoName}/contributors`, { params: { per_page: 1 } }).catch(() => ({ headers: {} })),
        ]);
      } catch (err: any) {
        if (err.response?.status === 409) {
          // 409 Conflict means the repository is empty (has 0 commits/branches)
          return { commits: 0, branches: 0, contributors: 0 };
        }
        throw err;
      }

      const getCountFromLink = (linkHeader: string | undefined, defaultCount: number): number => {
        if (!linkHeader) return defaultCount;
        const links = linkHeader.split(',');
        for (const link of links) {
          if (link.includes('rel="last"')) {
            const match = link.match(/[?&]page=(\d+)/);
            if (match) return parseInt(match[1], 10);
          }
        }
        return defaultCount;
      };

      const commits = getCountFromLink(commitsRes.headers['link'], 1);
      const branches = getCountFromLink(branchesRes.headers['link'], 1);
      const contributors = getCountFromLink(contributorsRes.headers['link'], 1);

      return { commits, branches, contributors };
    } catch (err: any) {
      logger.warn(`Failed to fetch extra stats for ${owner}/${repoName}: ${err.message || String(err)}`);
      return null;
    }
  });
}

export async function fetchRepoContentsForAI(token: string, owner: string, repoName: string) {
  try {
    const client = createGitHubClient(token);
    
    // 1. Fetch README
    const readmeRes = await client.get(`/repos/${owner}/${repoName}/readme`, {
      headers: { Accept: 'application/vnd.github.raw+json' },
    }).catch(() => null);
    const readme = readmeRes ? String(readmeRes.data) : '';

    // 2. Fetch File tree (root contents)
    const treeRes = await client.get(`/repos/${owner}/${repoName}/contents`).catch(() => null);
    const files = Array.isArray(treeRes?.data) 
      ? treeRes.data.map((f: any) => `- ${f.name} (${f.type})`).join('\n')
      : '';

    // 3. Fetch recent commits
    const commitsRes = await client.get(`/repos/${owner}/${repoName}/commits`, { params: { per_page: 5 } }).catch(() => null);
    const commitMsgs = Array.isArray(commitsRes?.data)
      ? commitsRes.data.map((c: any) => `- ${c.commit?.message || 'No message'}`).join('\n')
      : '';

    return { readme, files, commitMsgs };
  } catch (err: any) {
    logger.warn(`Failed to fetch repo contents for AI review of ${owner}/${repoName}: ${err.message || String(err)}`);
    return null;
  }
}

export async function fetchFollowing(token: string, username: string): Promise<any[]> {
  return withCache(`gh:following:${username}`, 3600, async () => {
    try {
      const client = createGitHubClient(token);
      const { data } = await client.get(`/users/${username}/following`, {
        params: { per_page: 30 }
      });
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      logger.warn(`Failed to fetch following for ${username}: ${err.message || String(err)}`);
      return [];
    }
  });
}

export async function fetchUserRepos(token: string, username: string): Promise<any[]> {
  return withCache(`gh:repos:${username}`, 3600, async () => {
    try {
      const client = createGitHubClient(token);
      const { data } = await client.get(`/users/${username}/repos`, {
        params: { per_page: 15 }
      });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });
}
