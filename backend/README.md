# DevPulse Backend

Production-ready Node.js + Express + TypeScript backend for the DevPulse GitHub analytics platform.

## Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: MongoDB (Mongoose)
- **Cache + Queue**: Redis + BullMQ  
- **LLM**: Google Gemini 1.5 Flash (free tier)
- **Auth**: GitHub OAuth 2.0 + express-session
- **PDF**: pdfkit

## Quick Start

### 1. Prerequisites
- Node.js 20+
- Docker (for MongoDB + Redis)

### 2. Setup

```bash
# From DevPulse-main/backend/
cp .env.example .env
# Fill in your values (see below)
```

### 3. Get API Keys (all free)

| Key | Where to get |
|---|---|
| `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` | [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps → New |
| `GEMINI_API_KEY` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |

**GitHub OAuth App settings:**
- Homepage URL: `http://localhost:5173`
- Callback URL: `http://localhost:5000/api/auth/github/callback`

### 4. Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste this as ENCRYPTION_KEY in .env
```

### 5. Start services

```bash
# Start MongoDB + Redis
docker-compose up -d

# Install dependencies
npm install

# Seed database with mock data
npm run seed

# Start dev server
npm run dev
```

Server runs on **http://localhost:5000**

### 6. Connect Frontend

In your frontend, set the API base URL. Create/update `DevPulse-main/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## API Reference

### Auth
```
GET  /api/auth/github           → Redirect to GitHub OAuth
GET  /api/auth/github/callback  → OAuth callback (sets session)
GET  /api/auth/me               → Current user profile
POST /api/auth/logout           → Logout
```

### User / Dashboard
```
GET /api/user/me               → UserProfile
GET /api/user/me/repos         → Repository[] (sort=stars|updated|health&q=search)
GET /api/user/me/activity      → ActivityData[] (365 days heatmap)
GET /api/user/me/languages     → LanguageStats[]
GET /api/user/me/growth        → Monthly growth data
```

### Analytics
```
GET /api/user/me/analytics/summary  → Commit/PR/Issue/Review counts
GET /api/user/me/analytics/weekly   → Weekly contribution breakdown
GET /api/user/me/analytics/skills   → Skill radar (Gemini AI)
GET /api/user/me/analytics/growth   → Monthly stars + followers
```

### AI Features (rate limited: 20/hr/user)
```
POST /api/repos/:repoId/ai-review               → AI code review
GET  /api/user/me/insights                      → AI insights (cached 4h)
POST /api/user/me/insights/regenerate           → Queue regeneration → { jobId }
GET  /api/jobs/:jobId                           → Poll job status
POST /api/user/me/career/analyze  { role }      → CareerAnalysis (cached 24h)
GET  /api/user/me/career/analyze?role=...       → Same (GET version)
POST /api/compare  { user1, user2 }             → ComparisonResult
```

### Explore
```
GET /api/explore/trending-repos
GET /api/explore/trending-topics
GET /api/explore/top-users
GET /api/explore/search?q=...&type=repos|topics|users
```

### Leaderboard
```
GET /api/leaderboard?timeRange=week|month|year|all&category=all|frontend|backend|devops|ai-ml
GET /api/users/:username/profile
GET /api/github/user/:username
```

### Reports
```
GET  /api/reports
POST /api/reports/generate  { type }     → { reportId, status: "processing" }
GET  /api/reports/:reportId              → Report (poll status)
GET  /api/reports/:reportId/download    → PDF stream
```

### Settings
```
GET  /api/user/me/settings
PUT  /api/user/me/settings/profile
PUT  /api/user/me/settings/notifications
PUT  /api/user/me/settings/privacy
```

## Testing

```bash
npm test
```

Tests cover the Score Calculator (health score + leaderboard score) with edge cases.

## Production Deployment

```bash
npm run build
docker build -t devpulse-backend .
```

Set all env vars in your hosting platform (Railway/Render/Fly.io), then deploy.
