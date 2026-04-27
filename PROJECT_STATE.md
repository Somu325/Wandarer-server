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

Phase 1 — Backend: IN PROGRESS
Phase 2 — Frontend: NOT STARTED (blocked on Phase 1)

---

## FILE COMPLETION STATUS

Agents: mark each file [DONE - date] when complete. Add a one-line note.

### config/
- [DONE - 2026-04-27] server/config/db.ts (MongoDB connect + TTL)
- [DONE - 2026-04-27] server/config/gemini.ts (Gemini SDK + model export)

### models/
- [DONE - 2026-04-27] server/models/Profile.model.ts (Singleton profile)
- [DONE - 2026-04-27] server/models/Job.model.ts (ExternalId & TTL support)
- [DONE - 2026-04-27] server/models/Bookmark.model.ts (Denormalized job data)
- [DONE - 2026-04-27] server/models/Search.model.ts (AI Cache / ai_cache)

### prompts/
- [ ] server/prompts/master.prompt.ts
- [ ] server/prompts/jobScore.prompt.ts
- [ ] server/prompts/gigIdeas.prompt.ts
- [ ] server/prompts/rateEstimate.prompt.ts
- [ ] server/prompts/bulletRewrite.prompt.ts
- [ ] server/prompts/coverLetter.prompt.ts

### services/
- [ ] server/services/cache.service.ts
- [ ] server/services/gemini.service.ts
- [ ] server/services/context.service.ts
- [ ] server/services/jobFetch.service.ts

### routes/
- [ ] server/routes/profile.routes.ts
- [ ] server/routes/jobs.routes.ts
- [ ] server/routes/freelance.routes.ts
- [ ] server/routes/resume.routes.ts
- [ ] server/routes/assistant.routes.ts

### middleware/
- [ ] server/middleware/rateLimiter.ts

### jobs/
- [ ] server/jobs/feedRefresh.cron.ts

### root/
- [ ] server/index.ts
- [DONE - 2026-04-27] tsconfig.json (ESM, strict foundation)
- [DONE - 2026-04-27] package.json (Dependencies & ts-node-dev setup)
- [DONE - 2026-04-27] .env (values filled in)

---

## BUILD ORDER — FOLLOW THIS SEQUENCE

Agents must follow this order. Do not skip ahead.

```
1.  tsconfig.json           Foundation — TypeScript config
2.  package.json            Dependencies declared
3.  .env                    All env vars with placeholder values
4.  config/db.ts            MongoDB connect + TTL indexes
5.  config/gemini.ts        Gemini SDK init + model export
6.  models/Profile.model.ts
7.  models/Job.model.ts
8.  models/Bookmark.model.ts
9.  models/Search.model.ts  (ai_cache collection)
10. prompts/master.prompt.ts
11. prompts/jobScore.prompt.ts
12. prompts/gigIdeas.prompt.ts
13. prompts/rateEstimate.prompt.ts
14. prompts/bulletRewrite.prompt.ts
15. prompts/coverLetter.prompt.ts
16. services/cache.service.ts
17. services/gemini.service.ts
18. services/context.service.ts
19. services/jobFetch.service.ts
20. routes/profile.routes.ts
21. routes/jobs.routes.ts
22. routes/freelance.routes.ts
23. routes/resume.routes.ts
24. routes/assistant.routes.ts
25. middleware/rateLimiter.ts
26. jobs/feedRefresh.cron.ts
27. server/index.ts         Wire everything together
```

---

## API ROUTES TRACKER

Mark each route [DONE] when implemented and tested.

### Profile
- [ ] GET  /api/profile
- [ ] PATCH /api/profile
- [ ] GET  /api/profile/context

### Jobs
- [ ] GET  /api/jobs
- [ ] POST /api/jobs/refresh
- [ ] POST /api/jobs/score

### Freelance
- [ ] GET  /api/freelance/ideas
- [ ] GET  /api/freelance/rates

### Resume
- [ ] POST /api/resume/rewrite
- [ ] POST /api/resume/coverletter

### Assistant
- [ ] POST /api/assistant/chat

### Bookmarks
- [ ] GET    /api/bookmarks
- [ ] POST   /api/bookmarks
- [ ] PATCH  /api/bookmarks/:id
- [ ] DELETE /api/bookmarks/:id

---

## DECISIONS LOG

Record any architectural decisions made during the build here.
Format: [date] — decision — reason

(empty — no decisions made yet)

---

## KNOWN ISSUES / BLOCKERS

(empty — none yet)

---

## CHANGE LOG

Agents append an entry here after every task. Format:
[date] [file] — what was done

[2026-04-27] [tsconfig.json, package.json] — Foundation setup: ESM, strict mode, and exact dependency stack.
[2026-04-27] [.env, config/db.ts, config/gemini.ts] — Configured environment variables, MongoDB connection with retry logic, and Gemini SDK initialization.
[2026-04-27] [models/] — Implemented Profile, Job, Bookmark, and Search (AiCache) models with strict typing and project rules.