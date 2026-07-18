/**
 * claude.career.service.ts
 *
 * Career analysis pipeline:
 *   1. Fetch user's REAL GitHub repos (public, unauthenticated fallback if token fails)
 *   2. Analyse languages/patterns against role requirements
 *   3. If GROQ_API_KEY set → call Groq Llama-3.3-70b (free)
 *      elif GEMINI_API_KEY starts with AIzaSy → call Gemini 1.5 Flash (free)
 *      else → rich deterministic role-aware analysis (no API needed)
 *
 * In-memory cache: 30-min TTL keyed by `${username}:${role}`.
 */

import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CareerAnalysisResult {
  role: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendedProjects: string[];
  recommendedCertifications: string[];
  interviewReadiness: number;
  resumeFeedback: string;
  portfolioSuggestions: string[];
  roleMatch: string;
  learningRoadmap: {
    title: string;
    description: string;
    resources: string[];
    estimatedTime: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

// ─── In-memory cache ──────────────────────────────────────────────────────────

interface CacheEntry { data: CareerAnalysisResult; expiresAt: number; }
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000;

function getCached(key: string): CareerAnalysisResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}
function setCached(key: string, data: CareerAnalysisResult): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── GitHub fetcher ───────────────────────────────────────────────────────────

interface GitHubRepo {
  name: string; description: string | null; language: string | null;
  stargazers_count: number; fork: boolean; pushed_at: string;
  languages_url: string; html_url: string;
}

interface EnrichedRepo {
  name: string; description: string; language: string;
  stars: number; languages: string[]; hasTests: boolean; url: string;
}

async function fetchReposUnauthenticated(username: string): Promise<GitHubRepo[]> {
  const { data } = await axios.get<GitHubRepo[]>(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
    { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
  );
  return data;
}

async function fetchReposAuthenticated(username: string, token: string): Promise<GitHubRepo[]> {
  const { data } = await axios.get<GitHubRepo[]>(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}

async function fetchTopRepos(username: string, githubToken?: string): Promise<EnrichedRepo[]> {
  let rawRepos: GitHubRepo[] = [];

  // Try authenticated first (higher rate limits), fall back to public unauthenticated
  if (githubToken && !githubToken.includes('mock')) {
    try {
      rawRepos = await fetchReposAuthenticated(username, githubToken);
    } catch {
      logger.warn(`Authenticated GitHub fetch failed for ${username} — retrying unauthenticated`);
      rawRepos = await fetchReposUnauthenticated(username);
    }
  } else {
    rawRepos = await fetchReposUnauthenticated(username);
  }

  const now = Date.now();
  const scored = rawRepos
    .filter((r) => !r.fork)
    .map((r) => {
      const ageDays = (now - new Date(r.pushed_at).getTime()) / (1000 * 60 * 60 * 24);
      return { repo: r, score: r.stargazers_count * 2 + Math.max(0, 100 - ageDays / 3) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const authHeaders: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const enriched = await Promise.all(
    scored.map(async ({ repo }) => {
      let languages: string[] = [];
      let hasTests = false;
      try {
        const { data: langMap } = await axios.get<Record<string, number>>(
          repo.languages_url, { headers: authHeaders }
        );
        languages = Object.keys(langMap);
        const { data: treeData } = await axios.get<{ tree: { path: string }[] }>(
          `https://api.github.com/repos/${username}/${repo.name}/git/trees/HEAD?recursive=0`,
          { headers: authHeaders }
        );
        hasTests = treeData.tree.some((item) =>
          /^(tests?|spec|__tests__|cypress|e2e)$/i.test(item.path)
        );
      } catch { /* non-fatal */ }
      return {
        name: repo.name,
        description: repo.description ?? '',
        language: repo.language ?? 'Unknown',
        stars: repo.stargazers_count,
        languages,
        hasTests,
        url: repo.html_url,
      };
    })
  );

  return enriched;
}

// ─── Role definitions ─────────────────────────────────────────────────────────

interface RoleDefinition {
  coreSkills: string[];
  niceToHave: string[];
  certifications: string[];
  projectIdeas: string[];
  resources: Record<string, string[]>;
}

const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
  'Frontend Developer': {
    coreSkills: ['TypeScript', 'JavaScript', 'React', 'HTML', 'CSS'],
    niceToHave: ['Next.js', 'Vue', 'Tailwind', 'Vite', 'Webpack', 'Testing Library'],
    certifications: ['Meta Frontend Developer Certificate', 'Google UX Design Certificate', 'AWS Certified Cloud Practitioner'],
    projectIdeas: ['Build a multi-step form with React Hook Form & Zod', 'Create a design-system component library with Storybook', 'Build a real-time dashboard using WebSockets and Recharts'],
    resources: {
      'TypeScript': ['TypeScript Deep Dive (Basarat)', 'typescriptlang.org/docs'],
      'React': ['react.dev official docs', 'Epic React by Kent C. Dodds'],
      'CSS': ['CSS Tricks', 'Every Layout by Andy Bell'],
    },
  },
  'Backend Developer': {
    coreSkills: ['Node.js', 'Python', 'PostgreSQL', 'REST', 'Docker'],
    niceToHave: ['Go', 'GraphQL', 'Kafka', 'Redis', 'gRPC', 'Kubernetes'],
    certifications: ['AWS Certified Developer – Associate', 'MongoDB Associate Developer', 'PostgreSQL Professional Certificate'],
    projectIdeas: ['Build a rate-limited REST API with Node.js + Fastify + PostgreSQL', 'Implement a job queue system using BullMQ and Redis', 'Create a GraphQL API with real-time subscriptions'],
    resources: {
      'Node.js': ['nodejs.org docs', 'Node.js Design Patterns (book)'],
      'PostgreSQL': ['postgresqltutorial.com', 'Use the Index, Luke'],
      'Docker': ['docs.docker.com', 'Docker Deep Dive (Nigel Poulton)'],
    },
  },
  'Full Stack Developer': {
    coreSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    niceToHave: ['Next.js', 'GraphQL', 'Redis', 'Kubernetes', 'Terraform', 'CI/CD'],
    certifications: ['AWS Certified Developer – Associate', 'Meta Full Stack Engineer Certificate', 'GitHub Actions Certification'],
    projectIdeas: ['Build a full-stack SaaS app with Next.js, Prisma, and Stripe', 'Create a real-time chat app with WebSockets and Redis pub/sub', 'Implement OAuth2 from scratch with JWT refresh tokens'],
    resources: {
      'Next.js': ['nextjs.org/docs', 'Full Stack Open (University of Helsinki)'],
      'PostgreSQL': ['postgresqltutorial.com', 'Prisma.io docs'],
      'Docker': ['docs.docker.com/get-started', 'Docker & Kubernetes: The Practical Guide (Udemy)'],
    },
  },
  'AI Engineer': {
    coreSkills: ['Python', 'LangChain', 'PyTorch', 'Hugging Face', 'OpenAI API'],
    niceToHave: ['CUDA', 'TensorFlow', 'MLflow', 'Pinecone', 'FastAPI', 'Triton'],
    certifications: ['DeepLearning.AI Machine Learning Specialization', 'Google Professional ML Engineer', 'Hugging Face NLP Course'],
    projectIdeas: ['Build a RAG (retrieval-augmented generation) document Q&A app', 'Create a fine-tuned LLM for domain-specific tasks using LoRA', 'Build an AI agent with tool-calling using LangGraph'],
    resources: {
      'LangChain': ['python.langchain.com/docs', 'LangChain Handbook'],
      'PyTorch': ['pytorch.org/tutorials', 'fast.ai Practical Deep Learning'],
      'Hugging Face': ['huggingface.co/learn', 'NLP with Transformers (book)'],
    },
  },
  'ML Engineer': {
    coreSkills: ['Python', 'scikit-learn', 'Pandas', 'NumPy', 'MLflow'],
    niceToHave: ['PyTorch', 'TensorFlow', 'Spark', 'Airflow', 'Kubernetes', 'dbt'],
    certifications: ['Google Professional ML Engineer', 'DataCamp ML Scientist Track', 'AWS Certified ML Specialty'],
    projectIdeas: ['Build an end-to-end ML pipeline with MLflow tracking and model registry', 'Deploy a real-time prediction API using FastAPI and Docker', 'Build a feature store using Redis + PostgreSQL'],
    resources: {
      'MLflow': ['mlflow.org/docs', 'Practical MLflow (O\'Reilly)'],
      'scikit-learn': ['scikit-learn.org/stable/user_guide', 'Hands-On ML with Scikit-Learn (Géron)'],
      'Pandas': ['pandas.pydata.org/docs', '10 Minutes to Pandas'],
    },
  },
  'DevOps Engineer': {
    coreSkills: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'Bash'],
    niceToHave: ['Helm', 'ArgoCD', 'Prometheus', 'Grafana', 'AWS', 'GCP'],
    certifications: ['Certified Kubernetes Administrator (CKA)', 'HashiCorp Certified: Terraform Associate', 'AWS DevOps Engineer Professional'],
    projectIdeas: ['Build a GitOps pipeline with ArgoCD and Helm on Kubernetes', 'Set up a full observability stack: Prometheus + Grafana + Loki', 'Automate cloud infrastructure with Terraform modules'],
    resources: {
      'Kubernetes': ['kubernetes.io/docs', 'Kubernetes in Action (Manning)'],
      'Terraform': ['developer.hashicorp.com/terraform/docs', 'Terraform: Up & Running (book)'],
      'GitHub Actions': ['docs.github.com/actions', 'GitHub Actions in Action (Manning)'],
    },
  },
  'Cloud Engineer': {
    coreSkills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Networking'],
    niceToHave: ['GCP', 'Azure', 'Pulumi', 'Serverless Framework', 'CDK', 'CloudFormation'],
    certifications: ['AWS Solutions Architect Associate', 'Google Professional Cloud Architect', 'Certified Kubernetes Administrator (CKA)'],
    projectIdeas: ['Deploy a microservices app on AWS EKS with Terraform', 'Build a serverless data pipeline with AWS Lambda + S3 + Glue', 'Set up multi-region failover with Route53 and CloudFront'],
    resources: {
      'AWS': ['docs.aws.amazon.com', 'AWS Well-Architected Framework'],
      'Terraform': ['developer.hashicorp.com/terraform', 'Terraform: Up & Running (book)'],
      'Kubernetes': ['kubernetes.io/docs', 'CKAD/CKA study guides on github.com/dgkanatsios'],
    },
  },
  'Cybersecurity Engineer': {
    coreSkills: ['Python', 'Bash', 'Networking', 'Linux', 'Cryptography'],
    niceToHave: ['C', 'C++', 'Rust', 'Metasploit', 'Wireshark', 'Burp Suite'],
    certifications: ['CompTIA Security+', 'Certified Ethical Hacker (CEH)', 'Offensive Security OSCP'],
    projectIdeas: ['Build a network packet analyser in Python using Scapy', 'Create a CTF challenge solution writeup portfolio', 'Implement a basic firewall rule engine with eBPF'],
    resources: {
      'Python': ['python.org/doc', 'Black Hat Python (book)'],
      'Networking': ['Cisco Networking Academy', 'The Web Application Hacker\'s Handbook'],
      'Cryptography': ['cryptopals.com challenges', 'Serious Cryptography (Aumasson)'],
    },
  },
  'Data Scientist': {
    coreSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Jupyter'],
    niceToHave: ['R', 'Tableau', 'Power BI', 'Spark', 'dbt', 'Plotly'],
    certifications: ['Google Data Analytics Certificate', 'IBM Data Science Professional Certificate', 'DataCamp Data Scientist Track'],
    projectIdeas: ['Build an end-to-end EDA + ML project with a public dataset (Kaggle)', 'Create an interactive data dashboard with Plotly Dash or Streamlit', 'Implement A/B testing analysis with statistical significance testing'],
    resources: {
      'Python': ['python.org/doc', 'Python for Data Analysis (Wes McKinney)'],
      'SQL': ['mode.com/sql-tutorial', 'Learning SQL (Alan Beaulieu)'],
      'Pandas': ['pandas.pydata.org/docs', 'Effective Pandas (Matt Harrison)'],
    },
  },
  'Mobile Developer': {
    coreSkills: ['React Native', 'JavaScript', 'TypeScript', 'Expo'],
    niceToHave: ['Swift', 'Kotlin', 'Flutter', 'Dart', 'Firebase', 'AppStore Connect'],
    certifications: ['Google Associate Android Developer', 'Apple Swift Certification', 'React Native Certification (Udemy)'],
    projectIdeas: ['Build a cross-platform task manager app with offline sync', 'Create a real-time chat app using React Native + Firebase', 'Implement biometric authentication in an Expo app'],
    resources: {
      'React Native': ['reactnative.dev/docs', 'React Native in Action (Manning)'],
      'Flutter': ['flutter.dev/docs', 'Flutter in Action (Manning)'],
      'TypeScript': ['typescriptlang.org/docs', 'TypeScript Deep Dive (Basarat)'],
    },
  },
};

// ─── Rich deterministic analysis ──────────────────────────────────────────────

function buildRichFallback(
  username: string,
  targetRole: string,
  repos: EnrichedRepo[]
): CareerAnalysisResult {
  const def = ROLE_DEFINITIONS[targetRole] ?? ROLE_DEFINITIONS['Full Stack Developer'];
  const allLangs = [...new Set(repos.flatMap((r) => r.languages).concat(repos.map((r) => r.language)))];
  const allLangsLower = allLangs.map((l) => l.toLowerCase());

  // Score each core skill
  const matchedCore = def.coreSkills.filter((s) =>
    allLangsLower.some((l) => l.includes(s.toLowerCase()))
  );
  const matchedNice = def.niceToHave.filter((s) =>
    allLangsLower.some((l) => l.includes(s.toLowerCase()))
  );
  const missingCore = def.coreSkills.filter((s) =>
    !allLangsLower.some((l) => l.includes(s.toLowerCase()))
  );

  const repoCount = repos.length;
  const coreRatio = def.coreSkills.length > 0 ? matchedCore.length / def.coreSkills.length : 0;
  const niceRatio = def.niceToHave.length > 0 ? matchedNice.length / def.niceToHave.length : 0;
  const hasTests = repos.some((r) => r.hasTests);
  const hasGoodDocs = repos.some((r) => r.description.length > 30);

  // Calculate score (0–100)
  const baseScore = repoCount === 0
    ? 0
    : Math.round(
        coreRatio * 55 +       // core skills: up to 55 pts
        niceRatio * 20 +        // nice-to-have: up to 20 pts
        (hasTests ? 10 : 0) +   // test coverage: 10 pts
        (hasGoodDocs ? 5 : 0) + // documentation: 5 pts
        Math.min(repoCount * 1.25, 10) // repo breadth: up to 10 pts
      );

  const score = Math.max(5, Math.min(95, baseScore));
  const interviewReadiness = Math.round(score * 0.85);
  const roleMatch = coreRatio >= 0.65 ? 'Strong match' : coreRatio >= 0.35 ? 'Partial match' : 'Low match';

  // Strengths — specific to what they actually have
  const strengths: string[] = [];
  if (matchedCore.length > 0) {
    strengths.push(`Core ${targetRole} skills demonstrated: ${matchedCore.slice(0, 3).join(', ')}`);
  }
  if (matchedNice.length > 0) {
    strengths.push(`Bonus technologies in portfolio: ${matchedNice.slice(0, 3).join(', ')}`);
  }
  if (hasTests) strengths.push('Commits to code quality — repositories include test suites');
  if (repoCount >= 5) strengths.push(`Active builder with ${repoCount} original (non-fork) public repositories`);
  if (hasGoodDocs) strengths.push('Good documentation habits — repositories have descriptive descriptions');
  if (strengths.length === 0) strengths.push('GitHub presence established — ready to build towards ' + targetRole);

  // Weaknesses — specific to what's missing
  const weaknesses: string[] = [];
  if (missingCore.length > 0) {
    weaknesses.push(`No evidence of core ${targetRole} skills: ${missingCore.slice(0, 3).join(', ')}`);
  }
  if (!hasTests) weaknesses.push('No test suites found — testing is critical for professional roles');
  if (repoCount < 3) weaknesses.push('Limited portfolio breadth — recruiters want to see 5+ diverse projects');
  if (!hasGoodDocs) weaknesses.push('Sparse repository descriptions — documentation demonstrates professional maturity');
  if (weaknesses.length === 0) weaknesses.push('Deepen system design knowledge to stand out at senior interviews');

  // Resume feedback based on actual repos
  const topRepo = repos[0];
  const resumeFeedback = topRepo
    ? `Highlight your "${topRepo.name}" project prominently — it shows ${matchedCore[0] ?? topRepo.language} proficiency. Quantify impact: add metrics like performance improvements, user counts, or lines of code processed.`
    : `Build a flagship project specifically targeting ${targetRole} and make it the centerpiece of your resume. Employers want to see direct evidence of the role's core skills.`;

  // Portfolio suggestions
  const portfolioSuggestions: string[] = [
    `Pin your top 3 most ${targetRole}-relevant repositories on your GitHub profile`,
    `Add a detailed README with architecture diagrams and setup instructions to each pinned repo`,
    `Create a personal portfolio website showcasing live demos of your best projects`,
  ];

  // Learning roadmap from missing skills
  const roadmapSkills = [
    ...missingCore.slice(0, 2).map((s, i) => ({ skill: s, priority: (i === 0 ? 'high' : 'medium') as 'high' | 'medium' | 'low' })),
    ...def.niceToHave.filter((s) => !allLangsLower.includes(s.toLowerCase())).slice(0, 2).map((s) => ({ skill: s, priority: 'low' as const })),
  ];

  const learningRoadmap = roadmapSkills.map(({ skill, priority }) => ({
    title: `Master ${skill}`,
    description: `Learn ${skill} fundamentals, build a production-quality sample project, and document it on GitHub to demonstrate proficiency to recruiters.`,
    resources: def.resources[skill] ?? [`Official ${skill} documentation`, `${skill} on roadmap.sh`, `${skill} on FreeCodeCamp`],
    estimatedTime: priority === 'high' ? '4-6 weeks' : priority === 'medium' ? '2-4 weeks' : '1-2 weeks',
    priority,
  }));

  return {
    role: targetRole,
    score,
    strengths,
    weaknesses,
    missingSkills: missingCore.slice(0, 5),
    recommendedProjects: def.projectIdeas,
    recommendedCertifications: def.certifications,
    interviewReadiness,
    resumeFeedback,
    portfolioSuggestions,
    roleMatch,
    learningRoadmap,
  };
}

// ─── AI call helpers ──────────────────────────────────────────────────────────

function parseAIResult(raw: string, targetRole: string): CareerAnalysisResult {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return {
    role: targetRole,
    score: parsed.careerScore ?? 0,
    strengths: parsed.strengths ?? [],
    weaknesses: parsed.areasToImprove ?? [],
    missingSkills: parsed.missingSkills ?? [],
    recommendedProjects: parsed.recommendedProjects ?? [],
    recommendedCertifications: parsed.recommendedCertifications ?? [],
    interviewReadiness: parsed.interviewReadiness ?? 0,
    resumeFeedback: parsed.resumeFeedback ?? '',
    portfolioSuggestions: parsed.portfolioSuggestions ?? [],
    roleMatch: parsed.roleMatch ?? 'Partial match',
    learningRoadmap: (parsed.learningRoadmap ?? []).map((s: any) => ({
      title: s.title ?? '',
      description: s.description ?? '',
      resources: s.resources ?? [],
      estimatedTime: s.estimatedTime ?? '',
      priority: s.priority ?? 'medium',
    })),
  };
}

async function callGroq(prompt: string): Promise<string> {
  const client = new Groq({ apiKey: env.GROQ_API_KEY });
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
    temperature: 0.3,
  });
  return completion.choices[0]?.message?.content ?? '';
}

async function callGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── Main exported function ───────────────────────────────────────────────────

export async function analyzeCareerForUser(
  username: string,
  targetRole: string,
  githubToken?: string
): Promise<CareerAnalysisResult> {
  const cacheKey = `${username}:${targetRole}`;
  const cached = getCached(cacheKey);
  if (cached) { logger.info(`Career cache HIT: ${cacheKey}`); return cached; }

  // 1. Fetch real repos (unauthenticated fallback auto-applied)
  let repos: EnrichedRepo[] = [];
  try {
    repos = await fetchTopRepos(username, githubToken);
    logger.info(`Fetched ${repos.length} repos for @${username}`);
  } catch (err: any) {
    logger.warn(`Could not fetch GitHub repos for ${username}: ${err.message}`);
  }

  // 2. If we have NO repos at all, return zero-score
  if (repos.length === 0) {
    const result = buildRichFallback(username, targetRole, []);
    setCached(cacheKey, result);
    return result;
  }

  const allLangs = [...new Set(repos.flatMap((r) => r.languages).concat(repos.map((r) => r.language)))];
  const def = ROLE_DEFINITIONS[targetRole] ?? ROLE_DEFINITIONS['Full Stack Developer'];

  // 3. Build AI prompt (same for Groq and Gemini)
  const repoSummary = repos.map((r) =>
    `• ${r.name} (primary: ${r.language}, ⭐${r.stars}${r.hasTests ? ', has tests' : ''})\n  All languages: ${r.languages.join(', ') || r.language}\n  Description: ${r.description || 'No description'}`
  ).join('\n');

  const prompt = `You are a senior technical recruiter at a top tech company assessing a GitHub developer profile for the role of "${targetRole}".

Developer GitHub: @${username}
Target Role: ${targetRole}
Required core skills for ${targetRole}: ${def.coreSkills.join(', ')}
Nice-to-have skills: ${def.niceToHave.join(', ')}

Top ${repos.length} GitHub repositories (analysed from real data):
${repoSummary}

All programming languages detected: ${allLangs.join(', ') || 'none detected'}

Instructions:
- Be HONEST and SPECIFIC. Reference actual repo names and languages in your analysis.
- Give LOW careerScore (10–30) if their tech stack clearly does NOT match the role.
- Give MEDIUM score (35–65) for partial overlap.
- Give HIGH score (70–92) only when there is strong, direct evidence of the required skills.
- For strengths/weaknesses, reference the ACTUAL repos and languages, not generic statements.
- areasToImprove must be specific to the GAP between their repos and ${targetRole}.
- missingSkills must list actual missing skills from: ${def.coreSkills.join(', ')}.
- recommendedProjects must be specific to ${targetRole} (not generic).
- recommendedCertifications must be real certifications that exist for ${targetRole}.

Return ONLY valid JSON (no markdown, no extra text, no explanation):
{
  "careerScore": <integer 0-100>,
  "strengths": [<2-4 specific strings that reference their actual repos/languages>],
  "areasToImprove": [<2-4 specific gaps for the ${targetRole} role>],
  "missingSkills": [<core skills they are missing for ${targetRole}>],
  "recommendedProjects": [<3 specific project ideas for ${targetRole}>],
  "recommendedCertifications": [<2-3 real certifications for ${targetRole}>],
  "interviewReadiness": <integer 0-100>,
  "resumeFeedback": "<2 specific sentences referencing their actual best repo>",
  "portfolioSuggestions": [<2-3 specific portfolio improvements>],
  "roleMatch": "<Strong match | Partial match | Low match>",
  "learningRoadmap": [
    {"title":"<topic>","description":"<specific advice>","resources":["<real resource 1>","<real resource 2>"],"estimatedTime":"<X weeks>","priority":"<high|medium|low>"}
  ]
}`;

  // 4. Try LLM providers in priority order
  let result: CareerAnalysisResult | null = null;
  let provider = 'rich-fallback';

  if (env.GROQ_API_KEY) {
    try {
      const raw = await callGroq(prompt);
      result = parseAIResult(raw, targetRole);
      provider = 'Groq (llama-3.3-70b)';
    } catch (err: any) {
      logger.warn(`Groq failed: ${err.message}`);
    }
  }

  if (!result && env.GEMINI_API_KEY && env.GEMINI_API_KEY.startsWith('AIzaSy')) {
    try {
      const raw = await callGemini(prompt);
      result = parseAIResult(raw, targetRole);
      provider = 'Gemini 1.5 Flash';
    } catch (err: any) {
      logger.warn(`Gemini failed: ${err.message}`);
    }
  }

  // 5. Rich deterministic fallback — uses real repo data, role-specific certifications, project ideas
  if (!result) {
    result = buildRichFallback(username, targetRole, repos);
    provider = 'rich-deterministic-fallback';
  }

  logger.info(`Career analysis for ${username} → ${targetRole} | provider: ${provider} | score: ${result.score} | roleMatch: ${result.roleMatch}`);
  setCached(cacheKey, result);
  return result;
}
