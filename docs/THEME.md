# Wanderer — Theme & Dashboard Design System

Design philosophy: **Purposeful lightness.** Clean whites, meaningful color, no decoration for decoration's sake. Every color communicates something.

---

## Color Palette

### Base (Light Theme)

```css
--color-bg:           #F7F8FA   /* page background — warm off-white, not blinding */
--color-surface:      #FFFFFF   /* cards, panels, modals */
--color-surface-alt:  #F0F2F5   /* input backgrounds, hover states */
--color-border:       #E4E7EC   /* dividers, card outlines */
--color-border-focus: #3B82F6   /* focused inputs */

--color-text-primary: #111827   /* headings — near-black */
--color-text-body:    #374151   /* body copy */
--color-text-muted:   #6B7280   /* labels, captions, placeholders */
--color-text-disabled:#9CA3AF   /* disabled states */
```

### Brand Accent

```css
--color-primary:      #3B82F6   /* actions, links, active states — blue */
--color-primary-soft: #EFF6FF   /* hover backgrounds on primary items */
--color-primary-dark: #1D4ED8   /* pressed/active buttons */
```

### Semantic Colors (meaningful — not decorative)

```css
/* Job match scores */
--color-strong:       #16A34A   /* strong_match — green */
--color-strong-soft:  #DCFCE7
--color-partial:      #D97706   /* partial_match — amber */
--color-partial-soft: #FEF3C7
--color-weak:         #DC2626   /* weak_match — red */
--color-weak-soft:    #FEE2E2
--color-unscored:     #6B7280   /* null matchScore — gray */
--color-unscored-soft:#F3F4F6

/* Bookmark status */
--color-saved:        #6B7280
--color-applied:      #3B82F6
--color-interview:    #7C3AED   /* purple — excitement */
--color-offer:        #16A34A
--color-rejected:     #DC2626

/* Demand (freelance) */
--color-demand-high:  #16A34A
--color-demand-med:   #D97706
--color-demand-low:   #DC2626

/* Trend (rates) */
--color-rising:       #16A34A
--color-stable:       #6B7280
--color-falling:      #DC2626
```

---

## Typography

```css
--font-sans: 'Inter', 'system-ui', sans-serif    /* everything */
--font-mono: 'JetBrains Mono', 'monospace'       /* code, IDs, urls */

/* Scale */
--text-xs:   0.75rem   /* 12px — badges, timestamps */
--text-sm:   0.875rem  /* 14px — body, labels, table cells */
--text-base: 1rem      /* 16px — default body */
--text-lg:   1.125rem  /* 18px — card titles */
--text-xl:   1.25rem   /* 20px — section headers */
--text-2xl:  1.5rem    /* 24px — page titles */
--text-3xl:  1.875rem  /* 30px — stat numbers */

/* Weight */
--weight-normal:  400
--weight-medium:  500
--weight-semibold:600
--weight-bold:    700
```

---

## Spacing & Radius

```css
/* Spacing (4px base) */
--space-1:  0.25rem   /* 4px */
--space-2:  0.5rem    /* 8px */
--space-3:  0.75rem   /* 12px */
--space-4:  1rem      /* 16px */
--space-5:  1.25rem   /* 20px */
--space-6:  1.5rem    /* 24px */
--space-8:  2rem      /* 32px */
--space-10: 2.5rem    /* 40px */
--space-12: 3rem      /* 48px */

/* Radius */
--radius-sm:  0.375rem  /* 6px — buttons, badges */
--radius-md:  0.5rem    /* 8px — inputs, small cards */
--radius-lg:  0.75rem   /* 12px — cards */
--radius-xl:  1rem      /* 16px — large modals */

/* Shadow */
--shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
--shadow-modal:0 10px 40px rgba(0,0,0,0.12)
--shadow-focus:0 0 0 3px rgba(59,130,246,0.25)
```

---

## Core Components

### Card

```
bg: --color-surface
border: 1px solid --color-border
border-radius: --radius-lg
padding: --space-6
shadow: --shadow-card
```

### Button — Primary

```
bg: --color-primary
color: white
padding: space-2 space-4
radius: --radius-sm
font-weight: --weight-semibold
font-size: --text-sm
hover: bg → --color-primary-dark
disabled: opacity 0.5, cursor not-allowed
```

### Button — Ghost

```
bg: transparent
border: 1px solid --color-border
color: --color-text-body
hover: bg → --color-surface-alt
```

### Button — Danger

```
bg: transparent
border: 1px solid --color-weak
color: --color-weak
hover: bg → --color-weak-soft
```

### Match Score Badge

```
strong_match:  bg --color-strong-soft,  text --color-strong,  "Strong Match"
partial_match: bg --color-partial-soft, text --color-partial, "Partial Match"
weak_match:    bg --color-weak-soft,    text --color-weak,    "Weak Match"
null:          bg --color-unscored-soft,text --color-unscored,"Not Scored"
```

### Status Badge (Bookmarks)

```
saved:      bg #F3F4F6, text #374151
applied:    bg #EFF6FF, text #3B82F6
interview:  bg #F5F3FF, text #7C3AED
offer:      bg #DCFCE7, text #16A34A
rejected:   bg #FEE2E2, text #DC2626
```

### Input

```
bg: --color-surface-alt
border: 1px solid --color-border
radius: --radius-md
padding: space-2 space-3
font-size: --text-sm
focus: border-color → --color-border-focus, shadow → --shadow-focus
```

### Loading State

Use a subtle shimmer skeleton (not a spinner) for card content.
Use a button spinner (small inline SVG) for action buttons while fetching.

---

## Layout — App Shell

```
┌──────────────────────────────────────────────────┐
│  Sidebar (240px fixed)  │  Main content area      │
│                         │  (flex-1, scrollable)   │
│  Logo                   │                         │
│  ─────────              │  ┌── Page Header ──────┐ │
│  Dashboard              │  │ Title + action btn  │ │
│  Jobs Feed              │  └────────────────────┘ │
│  Bookmarks              │                         │
│  Freelance              │  ┌── Content ──────────┐ │
│  Resume Tools           │  │                     │ │
│  Assistant              │  │                     │ │
│  ─────────              │  └────────────────────┘ │
│  Profile                │                         │
└──────────────────────────────────────────────────┘
```

Sidebar bg: `--color-surface` with right border `--color-border`
Active nav item: bg `--color-primary-soft`, text `--color-primary`, left bar 3px solid `--color-primary`

---

## Pages — Layout & Data Mapping

### 1. Dashboard (/)

**Purpose:** At-a-glance health of job search.

```
┌── Stat Cards (4 across) ──────────────────────────┐
│ Total Jobs  │ Strong Matches │ Bookmarks │ Applied │
│   [count]   │    [count]     │  [count]  │ [count] │
└────────────────────────────────────────────────────┘

┌── Top 5 Jobs ─────────────────────────────────────┐
│  (sorted by matchScore desc, show top 5)          │
│  Each row: company logo | title | company |       │
│  match badge | verdict | "View" button            │
└────────────────────────────────────────────────────┘

┌── Recent Bookmarks ───────────────────────────────┐
│  Last 3 bookmarks with status badge               │
└────────────────────────────────────────────────────┘
```

**API calls on mount:**
- `GET /api/jobs` → derive stats + top 5
- `GET /api/jobs/bookmarks` → recent bookmarks

**Stat card data (computed from jobs array):**
```js
totalJobs     = jobs.length
strongMatches = jobs.filter(j => j.verdict === 'strong_match').length
bookmarks     = bookmarks.length
applied       = bookmarks.filter(b => b.status === 'applied').length
```

---

### 2. Jobs Feed (/jobs)

**Purpose:** Browse, filter, and score all fetched jobs.

```
┌── Toolbar ──────────────────────────────────────────┐
│  [Refresh Jobs 🔄]  Filter: [All ▾] Sort: [Score ▾] │
└─────────────────────────────────────────────────────┘

┌── Job Card (repeated) ──────────────────────────────┐
│  [Logo]  Title                          [Bookmark ♡] │
│          Company · Location · Remote                 │
│          Tags: [React] [Node.js] [...]               │
│          ────────────────────────────────            │
│          Match Score: ██████░░ 74        [Strong ✓]  │
│          Reason: "Strong match — Node.js + Socket.io" │
│          Missing: Redis, Docker                      │
│          ────────────────────────────────            │
│          [Apply →]  [Generate Cover Letter]          │
└─────────────────────────────────────────────────────┘
```

**Filter options (client-side, no extra API call):**
- All / Strong Match / Partial / Weak / Unscored
- Remote only toggle
- Tag filter (chips from all unique tags)

**matchScore bar:** `width: ${job.matchScore}%`, color from semantic palette

**On "Refresh Jobs":** Show full-page overlay with "Fetching and scoring jobs..." during `POST /api/jobs/refresh`. Disable button until complete.

**On "Generate Cover Letter":** Opens a side panel, sends `POST /api/resume/coverletter` with that job.

---

### 3. Bookmarks (/bookmarks)

**Purpose:** Track application pipeline.

```
Kanban columns: Saved → Applied → Interview → Offer → Rejected

Each card:
┌──────────────────────────┐
│ Title                    │
│ Company         [score]  │
│ [applied: Apr 12]        │
│ Notes (if any)           │
│ [Move status ▾] [Delete] │
└──────────────────────────┘
```

Or list view with status filter tabs across top.

**API calls:**
- `GET /api/jobs/bookmarks` on mount
- `PATCH /api/jobs/bookmarks/:id` on status change
- `DELETE /api/jobs/bookmarks/:id` on delete

---

### 4. Freelance (/freelance)

**Two sections — Tabs or Split layout:**

#### Gig Ideas

```
┌── Gig Card (8 cards, 2-3 col grid) ────────────────┐
│  Platform badge  [estimatedDemand badge]            │
│  Title (as it appears on platform)                  │
│  primarySkill tag                                   │
│  Earnings: $200 – $800 / project                   │
│  "Why you?" — 1 sentence specific to your profile  │
│  [View on Platform →]                               │
└─────────────────────────────────────────────────────┘
```

#### Rate Estimates

```
┌── Blended Rate Card ────────────────────────────────┐
│  $15-25/hr USD · ₹80k-120k/hr INR                  │
│  ₹1.5L-2.2L/month                                  │
│  Rationale (1-2 sentences)                          │
└─────────────────────────────────────────────────────┘

┌── By Skill Table ───────────────────────────────────┐
│  Skill        │ Rate (USD/hr)  │ Trend    │ Tip     │
│  Node.js      │  $15 – $30     │ Rising ↑ │  ...    │
│  React.js     │  $12 – $25     │ Stable → │  ...    │
└─────────────────────────────────────────────────────┘

┌── Positioning Advice ───────────────────────────────┐
│  2-3 sentences on how to charge the higher end      │
└─────────────────────────────────────────────────────┘
```

**Demand trend icon:** ↑ green / → gray / ↓ red

**API calls:**
- `GET /api/freelance/ideas` (cached 24h — usually instant after first call)
- `GET /api/freelance/rates` (cached 24h)

---

### 5. Resume Tools (/resume)

**Two panels side by side (or stacked on mobile):**

#### Bullet Rewriter

```
┌── Input ───────────────────────────────────────────┐
│  Job Description:  [textarea]                      │
│  Original bullet:  [input]                         │
│  [Rewrite →]                                       │
└─────────────────────────────────────────────────────┘

┌── Result ───────────────────────────────────────────┐
│  ✨ Rewritten:                                      │
│  "Architected REST APIs serving 10k+ requests/day" │
│  [Copy]                                            │
│                                                    │
│  Keywords matched: [Node.js] [scalable]            │
│  Metric added: Yes ✓                               │
│  Note: "Added quantified scale to strengthen impact" │
└─────────────────────────────────────────────────────┘
```

#### Cover Letter Generator

```
┌── Input ───────────────────────────────────────────┐
│  Job Title:        [input]                         │
│  Company:          [input]                         │
│  Job Description:  [textarea]                      │
│  [Generate Cover Letter →]                         │
└─────────────────────────────────────────────────────┘

┌── Result ───────────────────────────────────────────┐
│  Subject: [copy button]                            │
│  ─────────────────────────────────                 │
│  [full cover letter text]                          │
│                                                    │
│  Key selling points: [chip] [chip] [chip]          │
│  Red flags: [chip] [chip]  ← show in amber/red     │
│                                                    │
│  [Copy letter] [Download .txt]                     │
└─────────────────────────────────────────────────────┘
```

**Red flags** = skills in JD the user may lack — show honestly in amber/red chips with a note: "You may want to address these in your letter."

---

### 6. Assistant (/assistant)

```
┌── Chat Window ──────────────────────────────────────┐
│                                                     │
│  [assistant]  Hi Somasekhar! I know your profile   │
│               well. What can I help you with?      │
│                                                     │
│                     [user]  What jobs should I     │
│                             apply to first?        │
│                                                     │
│  [assistant]  Based on your Node.js + Socket.io... │
│                                                     │
│  ── Suggested follow-ups ───────────────────────── │
│  [How do I negotiate?]  [Which skill to learn?]    │
└─────────────────────────────────────────────────────┘
│  [Type a message...]                    [Send →]   │
└─────────────────────────────────────────────────────┘
```

**Suggested follow-ups** → render as clickable buttons below each AI response. On click, set as the next message and submit immediately.

**Message bubble colors:**
- User: bg `--color-primary`, text white, right-aligned
- Assistant: bg `--color-surface-alt`, text `--color-text-body`, left-aligned

---

### 7. Profile (/profile)

**Read view with inline edit per section:**

```
┌── Header Card ─────────────────────────────────────┐
│  Avatar (initials)  Name · Title                   │
│  Email · Phone · Location                          │
│  LinkedIn · GitHub                   [Edit ✏]     │
└─────────────────────────────────────────────────────┘

┌── AI Settings ─────────────────────────────────────┐
│  Seniority: [mid ▾]  YearsExp: [2]                 │
│  Work type: [both ▾] Remote: [remote ▾]            │
│  Salary: ₹6L – ₹12L (slider or inputs)            │
│  Target roles: [chip] [chip] [+ Add]               │
│                                         [Save]     │
│  (controls Chain 1 rebuild + rate cache bust)      │
└─────────────────────────────────────────────────────┘

┌── Summary ─────────────────────────────────────────┐
│  [paragraph text]                      [Edit ✏]   │
└─────────────────────────────────────────────────────┘

┌── Skills ──────────────────────────────────────────┐
│  Frontend:  [chip] [chip] [chip]                   │
│  Backend:   [chip] [chip]                          │
│  ...                                   [Edit ✏]   │
└─────────────────────────────────────────────────────┘

Experience / Projects / Education / Certifications
→ Each as a collapsible card with [Edit ✏] per section
```

**PATCH endpoints for each section:**
```
AI Settings  → PATCH /api/profile/section/aiSettings
Summary      → PATCH /api/profile/section/summary  (body: { summary: "..." })
Skills       → PATCH /api/profile/section/skills
Experience   → PATCH /api/profile/section/experience   (replaces entire array)
Projects     → PATCH /api/profile/section/projects
Education    → PATCH /api/profile/section/education
Certifications → PATCH /api/profile/section/certifications
Personal info  → PATCH /api/profile/section/personalInfo
```

**On any section save:** Show brief "Saved ✓" toast, and note "(AI context will refresh on next use)" since saving nulls contextBuiltAt.

---

## Empty & Error States

| State | Message | Action |
|-------|---------|--------|
| No jobs in DB | "No jobs yet. Hit Refresh to fetch the latest." | `[Refresh Jobs]` button |
| Jobs but none scored | "Jobs fetched but not scored yet." | `[Score Jobs]` button |
| No bookmarks | "Save jobs you like and track them here." | — |
| No profile | "Set up your profile to unlock all features." | redirect to /profile |
| API error | "Something went wrong. Try again." | `[Retry]` button |
| Rate limited | "Slow down — 15 requests per minute limit." | countdown timer |
| Gemini quota | "AI quota exceeded. Try again tomorrow." | — |

---

## Micro-interactions

- **Tab/section change:** Fade in (150ms opacity 0→1)
- **Card hover:** `translateY(-1px)` + shadow increase (100ms)
- **Button loading:** Replace label with small spinner, disable click
- **Toast notifications:** Slide in from bottom-right, auto-dismiss 3s
  - Success: green left border
  - Error: red left border
  - Info: blue left border
- **Score bar:** Animate width on first render (300ms ease-out)
- **Profile edit:** Inline, replace static text with input field in-place
