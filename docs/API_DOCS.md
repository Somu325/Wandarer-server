# Wanderer — API Routes Reference

Base URL: `http://localhost:5000`

---

## GET /health

No auth, no rate limit. Use as a connectivity check.

**Response:**
```json
{ "status": "ok", "timestamp": 1714213200000 }
```

---

## PROFILE

### GET /api/profile

Returns the singleton profile. `data` is `null` if no profile exists yet.

```
Response: { success: true, data: Profile | null }
```

---

### PATCH /api/profile

Full or partial profile update. Send any subset of profile fields.
Always invalidates the Gemini context cache.

```
Body: Partial<Profile>   (any fields, nested objects are replaced wholesale)

Response: { success: true, data: Profile }
```

**Example — update just summary:**
```json
PATCH /api/profile
{ "summary": "Updated summary text here" }
```

---

### PATCH /api/profile/section/:section

Granular update for one section. Send the section data directly in the body.

**Valid sections:**

| section | Body shape |
|---------|-----------|
| `personalInfo` | `{ name, title, email, phone, location, linkedin, github }` |
| `summary` | `{ summary: string }` — send as `{ "summary": "..." }` |
| `skills` | `{ frontend[], backend[], databases[], realTime[], toolsAndDevops[], other[] }` |
| `experience` | Array: `[{ role, company, employmentType, startDate, endDate, location, responsibilities[] }]` |
| `projects` | Array: `[{ name, techStack[], highlights[] }]` |
| `education` | Array: `[{ degree, fieldOfStudy, institution, startYear, endYear }]` |
| `certifications` | Array: `[{ title, issuer, description }]` |
| `aiSettings` | `{ seniority?, yearsExp?, workType?, remote?, salaryMin?, salaryMax?, targetRoles? }` |

> **Note for `summary`:** Send `{ "summary": "your new summary" }` — the whole body replaces the section field.
> **Note for `aiSettings`:** Only send the fields you want to change — others are untouched.

```
Response: { success: true, data: Profile }
Error: { success: false, error: { code: "INVALID_SECTION", message: "..." } }
```

**Examples:**
```json
PATCH /api/profile/section/aiSettings
{ "seniority": "senior", "salaryMin": 1200000, "salaryMax": 2000000 }

PATCH /api/profile/section/skills
{
  "frontend": ["React.js", "Next.js", "TypeScript"],
  "backend": ["Node.js", "Express.js"],
  "databases": ["MongoDB", "PostgreSQL"],
  "realTime": ["Socket.io"],
  "toolsAndDevops": ["Docker", "AWS"],
  "other": ["Razorpay"]
}
```

---

### GET /api/profile/context

Triggers Chain 1 — builds a dense AI summary of the profile.
Returns cached value if < 1 hour old (fast). Otherwise calls Gemini (2-5s).

**Requires:** Profile must exist (PATCH /api/profile first).

```
Response: {
  success: true,
  data: {
    contextString: string   // ~200 word dense summary — used internally by all other AI chains
  }
}
```

> Frontend use: you can display `contextString` as a "profile strength" summary. You don't need to call this directly — all AI endpoints call it internally. Only call it if you want to show the summary text to the user.

---

## JOBS

### GET /api/jobs

Returns all jobs sorted by `matchScore` descending. Unscored jobs (matchScore: null) appear last.

```
Response: {
  success: true,
  data: { jobs: Job[], count: number }
}
```

**Frontend notes:**
- `matchScore` is `null` until `POST /api/jobs/refresh` or `POST /api/jobs/score` is called
- `verdict`: `"strong_match"` → green, `"partial_match"` → yellow, `"weak_match"` → red, `null` → grey
- `companyLogo` may be an empty string — handle with fallback avatar
- `description` is full HTML/markdown — render with a sanitizer
- Jobs auto-expire from DB after 6 hours (TTL). Call refresh to repopulate.

---

### POST /api/jobs/refresh

Fetches fresh jobs from Remotive + Arbeit Now, upserts to DB, then scores all unscored jobs.
**Slow** — 5-30 seconds depending on number of jobs. Show a progress spinner.

```
Body: (none)

Response: {
  success: true,
  data: { fetched: number, scored: number }
}
```

---

### POST /api/jobs/score

Scores specific jobs by ID (use when you want to re-score selected jobs).

```
Body: { jobIds: string[] }

Response: { success: true, data: { scored: number } }
Errors:
  400 — jobIds missing or empty
  404 — no jobs found for given IDs
```

---

## BOOKMARKS

### GET /api/jobs/bookmarks

Returns all bookmarks sorted by `createdAt` descending.

```
Response: { success: true, data: Bookmark[] }
```

---

### POST /api/jobs/bookmarks

Create a bookmark. Works for both jobs in DB and external jobs (manually added).

```
Body: {
  jobRef?: string        // Job._id — optional, omit for external jobs
  externalUrl: string    // REQUIRED — the apply link
  title: string          // REQUIRED
  company: string        // REQUIRED
  matchScore?: number    // defaults to 0
}

Response: { success: true, data: Bookmark }   (HTTP 201)
Error: 400 — missing externalUrl, title, or company
```

---

### PATCH /api/jobs/bookmarks/:id

Update status, notes, or appliedAt.

```
Body: {
  status?: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  notes?: string
  appliedAt?: string    // ISO date string e.g. "2024-04-27T00:00:00.000Z"
}

Response: { success: true, data: Bookmark }
Error: 404 — bookmark not found
```

---

### DELETE /api/jobs/bookmarks/:id

Hard delete.

```
Response: { success: true, data: null }
Error: 404 — bookmark not found
```

---

## FREELANCE

### GET /api/freelance/ideas

Chain 3 — returns 8 freelance gig ideas tailored to the profile.
Cached 24 hours. First call is slow (3-6s), subsequent calls are instant.

```
Response: {
  success: true,
  data: {
    gigs: [
      {
        title: string              // gig title as it would appear on the platform
        platform: string           // e.g. "Upwork", "Fiverr", "Toptal"
        platformCategory: string   // platform's category
        primarySkill: string       // which profile skill this uses
        estimatedDemand: "high" | "medium" | "low"
        estimatedEarningsPerProject: { min: number, max: number }  // USD
        whyThisUser: string        // 1 sentence specific to this profile
        searchUrl: string          // pre-built search URL on that platform
      }
    ]
  }
}
```

---

### GET /api/freelance/rates

Chain 4 — rate estimates for international (USD) and domestic (INR) clients.
Cached 24 hours, keyed on top skills + seniority + yearsExp.
Recalculates automatically when you update aiSettings.

```
Response: {
  success: true,
  data: {
    blendedRate: {
      hourlyUSD: { min: number, max: number }
      hourlyINR: { min: number, max: number }
      monthlyINR: { min: number, max: number }
      rationale: string
    }
    bySkill: [
      {
        skill: string
        hourlyUSD: { min: number, max: number }
        demandTrend: "rising" | "stable" | "falling"
        marketNote: string
        monetisationTip: string
      }
    ]
    positioningAdvice: string    // 2-3 sentences on how to charge more
  }
}
```

---

## RESUME

### POST /api/resume/rewrite

Chain 5 — rewrites a single resume bullet targeted to a job description.
Never cached. Always calls Gemini (~2-4s).

```
Body: {
  bullet: string           // REQUIRED — the original resume bullet
  jobDescription: string   // REQUIRED — the target job description
}

Response: {
  success: true,
  data: {
    rewritten: string          // the new bullet (max 20 words, starts with action verb)
    actionVerb: string         // the verb used
    keywordsMatched: string[]  // JD keywords incorporated
    metricAdded: boolean       // true if a quantified outcome was added/inferred
    improvementNote: string    // 1 sentence explaining the biggest change
  }
}
Errors:
  400 — bullet or jobDescription missing/empty
  404 — profile not found
```

---

### POST /api/resume/coverletter

Chain 6 — generates a cover letter for a specific job.
Never cached. Always calls Gemini (~3-6s).

```
Body: {
  job: {
    title: string         // REQUIRED
    company: string
    description: string   // REQUIRED — full job description text
    // any other Job fields are accepted but these two are required
  }
}

Response: {
  success: true,
  data: {
    subject: string           // email subject line for the application
    body: string              // full cover letter (3 paragraphs)
    wordCount: number
    keySellingPoints: string[] // 3-5 specific strengths matched to this role
    redFlags: string[]         // skills in JD the user may be underqualified for
  }
}
Errors:
  400 — job.title or job.description missing
  404 — profile not found
```

---

## ASSISTANT

### POST /api/assistant/chat

Free-form career chat. Profile context is automatically injected into every request.
Never cached. Always calls Gemini (~2-5s).

```
Body: {
  messages: [
    { role: "user" | "assistant", content: string }
  ]
}

Response: {
  success: true,
  data: {
    reply: string               // actionable, profile-specific response
    suggestedFollowUps: string[] // 2-4 follow-up questions for quick-reply buttons
  }
}
Error: 400 — messages missing or empty
```

**How to maintain conversation history:**
```js
// Keep messages array in state, append each exchange
const messages = [
  { role: "user", content: "What jobs should I apply to first?" }
]
// POST with full messages array
// On response, push both user message and assistant reply into messages
messages.push({ role: "assistant", content: data.reply })
// Next request sends the full updated array
```
