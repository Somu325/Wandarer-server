# PROJECT_STATE.md
# Living document — agents must update this after every completed task
# Last updated: 2026-04-27

---

## PROJECT

Personal Job & Freelance Intelligence App
Stack: Node.js 20 + Express + TypeScript + MongoDB + Gemini 1.5 Flash
Phase: 1 — Backend only

---

## CURRENT STATUS

Phase 1 — Backend: COMPLETE ✅ — controllers split done, profile seeded
Phase 2 — Frontend: NOT STARTED

## GEMINI MODEL NOTE
gemini-1.5-flash is no longer available on v1beta API.
Active model: gemini-2.0-flash-lite (set in .env).
API key free-tier quota resets daily — step 8 (context) works when quota is fresh.

## PROFILE
Seeded via PATCH /api/profile. All sections populated.
To update a section: PATCH /api/profile/section/:section
Valid sections: personalInfo | summary | skills | experience | projects | education | certifications | aiSettings
For aiSettings body: { seniority, yearsExp, workType, remote, salaryMin, salaryMax, targetRoles }

## ARCHITECTURE CHANGE (2026-04-27)
Introduced src/controllers/ — one file per domain.
Routes are now pure wiring (import controller, wire with router.verb).
Bookmarks controller extracted from jobs.routes.ts into its own file.
Profile model extended with full resume structure.

---

## FILE COMPLETION STATUS

Agents: mark each file [DONE - date] when complete. Add a one-line note.

### config/
- [DONE - 2026-04-27] server/config/db.ts (MongoDB connect + TTL on jobs + ai_cache collections)
- [DONE - 2026-04-27] server/config/gemini.ts (Gemini SDK + model export)

### models/
- [DONE - 2026-04-27] server/models/Profile.model.ts (Rewritten: full spec fields — seniority, yearsExp, workType, remote, salaryMin/Max, targetRoles, contextString, contextBuiltAt)
- [DONE - 2026-04-27] server/models/Job.model.ts (Rewritten: added matchScore, matchReason, missingSkills, verdict)
- [DONE - 2026-04-27] server/models/Bookmark.model.ts (Rewritten: nullable jobRef, matchScore, appliedAt, denormalized fields)
- [DONE - 2026-04-27] server/models/Search.model.ts (Rewritten: cacheKey field, result as unknown/Mixed, collection: ai_cache)

### prompts/
- [DONE - 2026-04-27] server/prompts/master.prompt.ts (MASTER_SYSTEM_PROMPT constant, verbatim per spec)
- [DONE - 2026-04-27] server/prompts/jobScore.prompt.ts (buildJobScorePrompt — Chain 2)
- [DONE - 2026-04-27] server/prompts/gigIdeas.prompt.ts (buildGigIdeasPrompt — Chain 3)
- [DONE - 2026-04-27] server/prompts/rateEstimate.prompt.ts (buildRatePrompt — Chain 4)
- [DONE - 2026-04-27] server/prompts/bulletRewrite.prompt.ts (buildBulletPrompt — Chain 5)
- [DONE - 2026-04-27] server/prompts/coverLetter.prompt.ts (buildCoverLetterPrompt — Chain 6)

### services/
- [DONE - 2026-04-27] server/services/cache.service.ts (buildCacheKey SHA256, getCache with code TTL, setCache upsert)
- [DONE - 2026-04-27] server/services/gemini.service.ts (callGemini orchestrator — cache → SDK → strip fences → parse)
- [DONE - 2026-04-27] server/services/context.service.ts (buildProfileContext — Chain 1, 1h cache)
- [DONE - 2026-04-27] server/services/jobFetch.service.ts (fetchRemotive, fetchArbeitNow, fetchAndUpsertAll)

### routes/
- [DONE - 2026-04-27] server/routes/profile.routes.ts (GET /profile, PATCH /profile, GET /profile/context)
- [DONE - 2026-04-27] server/routes/jobs.routes.ts (GET /jobs, POST /jobs/refresh, POST /jobs/score + full bookmark CRUD)
- [DONE - 2026-04-27] server/routes/freelance.routes.ts (GET /freelance/ideas, GET /freelance/rates)
- [DONE - 2026-04-27] server/routes/resume.routes.ts (POST /resume/rewrite, POST /resume/coverletter)
- [DONE - 2026-04-27] server/routes/assistant.routes.ts (POST /assistant/chat)

### middleware/
- [DONE - 2026-04-27] server/middleware/rateLimiter.ts (15 req/min, standardHeaders, custom 429 handler)

### jobs/
- [DONE - 2026-04-27] server/jobs/feedRefresh.cron.ts (every 6h, fetch + batch-score 20 jobs per call)

### root/
- [DONE - 2026-04-27] server/index.ts (full entry point — dotenv first, cors, json, rateLimiter on /api, all routes, health, connectDB→listen→cron)
- [DONE - 2026-04-27] tsconfig.json (ESM, strict foundation)
- [DONE - 2026-04-27] package.json (Dependencies & ts-node-dev setup)
- [DONE - 2026-04-27] .env (values filled in)

---

## BUILD ORDER — FOLLOW THIS SEQUENCE

All 27 tasks completed.

---

## API ROUTES TRACKER

Mark each route [DONE] when implemented and tested.

### Profile
- [DONE] GET  /api/profile
- [DONE] PATCH /api/profile
- [DONE] GET  /api/profile/context

### Jobs
- [DONE] GET  /api/jobs
- [DONE] POST /api/jobs/refresh
- [DONE] POST /api/jobs/score

### Freelance
- [DONE] GET  /api/freelance/ideas
- [DONE] GET  /api/freelance/rates

### Resume
- [DONE] POST /api/resume/rewrite
- [DONE] POST /api/resume/coverletter

### Assistant
- [DONE] POST /api/assistant/chat

### Bookmarks
- [DONE] GET    /api/jobs/bookmarks
- [DONE] POST   /api/jobs/bookmarks
- [DONE] PATCH  /api/jobs/bookmarks/:id
- [DONE] DELETE /api/jobs/bookmarks/:id

---

## DECISIONS LOG

[2026-04-27] — bookmark routes mounted on jobs router (GET|POST /api/jobs/bookmarks, PATCH|DELETE /api/jobs/bookmarks/:id) — task 23 says "add to existing jobs router OR create separate" — chose jobs router to avoid a new file
[2026-04-27] — db.ts TTL target changed from 'searches' to 'ai_cache' — Search.model.ts uses collection: 'ai_cache' per task 08 spec; TTL must target the same collection
[2026-04-27] — config/gemini.ts exports 'model' not 'geminiModel' — gemini.service.ts imports as { model as geminiModel } to stay compatible without touching the already-done config file
[2026-04-27] — models rewritten to match spec — prior stubs had incorrect/missing fields that would have caused TypeScript compile errors in services and routes

---

## KNOWN ISSUES / BLOCKERS

Boot test (Task 27) has not been run yet. Server was running during build.
Step 8 (GET /api/profile/context) requires a real GEMINI_API_KEY in .env.

---

## CHANGE LOG

[2026-04-27] [tsconfig.json, package.json] — Foundation setup: ESM, strict mode, and exact dependency stack.
[2026-04-27] [.env, config/db.ts, config/gemini.ts] — Configured environment variables, MongoDB connection with retry logic, and Gemini SDK initialization.
[2026-04-27] [models/] — Implemented Profile, Job, Bookmark, and Search (AiCache) models with strict typing and project rules.
[2026-04-27] [.agents/skills/] — Populated agent skill files (update_state, write_api_route, gemini_integration, database_rules, typescript_standards).
[2026-04-27] [models/] — REWRITE: All 4 models corrected to match exact spec fields. Profile got 9 new fields. Job got scoring fields. Bookmark got matchScore+appliedAt+nullable jobRef. Search renamed key→cacheKey.
[2026-04-27] [config/db.ts] — Fixed TTL target: 'searches' → 'ai_cache'. Fixed success log to 'MongoDB connected: jobsearch'.
[2026-04-27] [prompts/] — All 6 prompt files implemented: master, jobScore, gigIdeas, rateEstimate, bulletRewrite, coverLetter.
[2026-04-27] [services/] — All 4 services implemented: cache, gemini, context, jobFetch.
[2026-04-27] [routes/] — All 5 route files implemented (profile, jobs+bookmarks, freelance, resume, assistant).
[2026-04-27] [middleware/rateLimiter.ts] — 15 req/min limiter with custom 429 handler.
[2026-04-27] [jobs/feedRefresh.cron.ts] — Every-6h cron with per-batch error isolation.
[2026-04-27] [src/index.ts] — Full entry point: dotenv first, cors, json, rateLimiter on /api, all routes mounted, /health unthrottled, connectDB→listen→startCron.