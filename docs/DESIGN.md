# Wanderer — System Design

**Base URL (dev):** `http://localhost:5000`
**Stack:** Node 22 + Express + TypeScript + MongoDB + Gemini 2.0

---

## Architecture

```
Frontend (React) → Express API (port 5000) → MongoDB Atlas
                                            → Gemini API (AI chains)
                                            → Remotive API (jobs)
                                            → Arbeit Now API (jobs)
```

## Response Envelope

**Every** endpoint returns this shape:

```ts
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }
```

**Error codes:**
| Code | HTTP | Meaning |
|------|------|---------|
| `SERVER_ERROR` | 500 | Unhandled exception |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `MISSING_FIELDS` | 400 | Required body field missing |
| `INVALID_SECTION` | 400 | Bad section name in profile PATCH |
| `PROFILE_NOT_FOUND` | 404 | No profile seeded yet |
| `RATE_LIMITED` | 429 | >15 req/min |

---

## Rate Limiting

`/api/*` → **15 requests per minute** (shared across all AI + data routes).
`/health` → unlimited.

Response headers include `RateLimit-Remaining` and `RateLimit-Reset`.

---

## CORS

Allowed origins: `http://localhost:3000`, `http://localhost:5173`

---

## AI Chains — Know Before You Call

These endpoints call Gemini and are **slow (2-8 seconds)**. Show a loading state.

| Endpoint | Chain | Cache | Slow? |
|----------|-------|-------|-------|
| `GET /api/profile/context` | Chain 1 — profile summary | 1 hour | Yes |
| `POST /api/jobs/refresh` | Chain 2 — job scoring | 6 hours | Yes |
| `POST /api/jobs/score` | Chain 2 — targeted score | 6 hours | Yes |
| `GET /api/freelance/ideas` | Chain 3 — gig ideas | 24 hours | Yes |
| `GET /api/freelance/rates` | Chain 4 — rate estimates | 24 hours | Yes |
| `POST /api/resume/rewrite` | Chain 5 — bullet rewrite | Never | Yes |
| `POST /api/resume/coverletter` | Chain 6 — cover letter | Never | Yes |
| `POST /api/assistant/chat` | Free chat | Never | Yes |

Fast (DB reads only): `GET /api/profile`, `GET /api/jobs`, `GET /api/jobs/bookmarks`

---

## TypeScript Interfaces (copy into frontend)

```ts
// ── Profile ──────────────────────────────────────────────
interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: { city: string; state: string; country: string }
  linkedin: string
  github: string
}

interface Skills {
  frontend: string[]
  backend: string[]
  databases: string[]
  realTime: string[]
  toolsAndDevops: string[]
  other: string[]
}

interface Experience {
  role: string
  company: string
  employmentType: string   // 'Full-Time' | 'Freelance' | 'Part-Time'
  startDate: string
  endDate: string          // 'Present' or date string
  location: string
  responsibilities: string[]
}

interface Project {
  name: string
  techStack: string[]
  highlights: string[]
}

interface Education {
  degree: string
  fieldOfStudy: string
  institution: string
  startYear: number
  endYear: number
}

interface Certification {
  title: string
  issuer: string
  description: string
}

interface Profile {
  _id: string
  personalInfo: PersonalInfo
  summary: string
  skills: Skills
  experience: Experience[]
  projects: Project[]
  education: Education[]
  certifications: Certification[]
  // AI tuning — set separately via PATCH /api/profile/section/aiSettings
  seniority: string        // 'junior' | 'mid' | 'senior' | 'lead'
  yearsExp: number
  workType: string         // 'fulltime' | 'freelance' | 'both'
  remote: string           // 'remote' | 'hybrid' | 'onsite'
  salaryMin: number        // INR per annum
  salaryMax: number
  targetRoles: string[]
  // Gemini cache — read-only for frontend
  contextString: string
  contextBuiltAt: string | null
  createdAt: string
  updatedAt: string
}

// ── Job ──────────────────────────────────────────────────
interface Job {
  _id: string
  externalId: string
  source: 'remotive' | 'arbeitnow'
  title: string
  company: string
  companyLogo: string      // URL or empty string
  description: string
  tags: string[]
  salary: string           // raw string e.g. "$80k-$120k" or empty
  isRemote: boolean
  location: string
  url: string              // apply link
  postedAt: string
  matchScore: number | null  // 0-100, null = not scored yet
  matchReason: string | null // 1-line AI reason
  missingSkills: string[]
  verdict: 'strong_match' | 'partial_match' | 'weak_match' | null
  fetchedAt: string
  createdAt: string
  updatedAt: string
}

// ── Bookmark ─────────────────────────────────────────────
interface Bookmark {
  _id: string
  jobRef: string | null    // Job._id, nullable (manually added bookmarks have null)
  externalUrl: string      // always stored — jobs expire after 6h
  title: string
  company: string
  matchScore: number
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  notes: string
  appliedAt: string | null
  createdAt: string
  updatedAt: string
}
```

---

## Data Flow — First Time Setup

```
1. App loads → GET /api/profile
   → data === null? Show onboarding/profile setup
   → data exists? Proceed to dashboard

2. On dashboard load:
   GET /api/jobs           (fast — DB read, may be empty)
   GET /api/jobs/bookmarks (fast — DB read)

3. User clicks "Refresh Jobs":
   POST /api/jobs/refresh  (slow — fetches + scores, show spinner)

4. User opens Freelance tab:
   GET /api/freelance/ideas (slow first time, cached 24h after)
   GET /api/freelance/rates (slow first time, cached 24h after)

5. User edits profile:
   PATCH /api/profile/section/:section
   → This nulls contextBuiltAt, forcing context rebuild on next AI call
```

---

## Cron Jobs (backend-only, no frontend action needed)

`feedRefresh.cron.ts` runs every 6 hours automatically:
- Fetches new jobs from Remotive + Arbeit Now
- Scores any unscored jobs against your profile
- No endpoint needed — it's self-managed
