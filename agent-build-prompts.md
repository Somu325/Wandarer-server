# AGENT BUILD PROMPTS
Personal Job & Freelance Intelligence App
Node.js 20 + Express + TypeScript + MongoDB + Gemini 1.5 Flash
Backend Phase 1 — 27 Tasks — Complete Build Sequence

How to Use This Document
Each task below is a complete, self-contained prompt. Copy it exactly into Antigravity Manager View. The agent will generate a Plan Artifact — review it and approve before any code is written. After each task completes, the agent updates PROJECT_STATE.md. Follow the task order exactly.
Step 1
Open Antigravity → Switch to Manager View
Step 2
Confirm GEMINI.md and AGENTS.md are in project root
Step 3
Paste the prompt → Wait for Plan Artifact → Approve → Let it build
Step 4
Verify PROJECT_STATE.md was updated before moving to next task




# Section 1 — Project Foundation
Sets up TypeScript config, package.json, and environment variables. Nothing else runs without these.

## TASK 01
TypeScript Config + Package Setup
**Phase: Foundation**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Read AGENTS.md, GEMINI.md, and PROJECT_STATE.md in full before doing anything.

Create tsconfig.json at the server/ root with these exact settings:
  - target: ES2022
  - module: NodeNext
  - moduleResolution: NodeNext
  - outDir: dist
  - rootDir: src
  - strict: true
  - esModuleInterop: true
  - skipLibCheck: true
  - forceConsistentCasingInFileNames: true

Create package.json at the server/ root with:
  - name: job-search-server
  - type: module
  - scripts:
      dev: ts-node-dev --respawn --transpile-only src/index.ts
      build: tsc
      start: node dist/index.js
  - dependencies: express, mongoose, @google/generative-ai,
    express-rate-limit, node-cron, dotenv, cors, axios
  - devDependencies: typescript, ts-node-dev, @types/express,
    @types/node, @types/cors, @types/node-cron

Do not install packages yet. Just declare them in package.json.
After completing both files, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  type: module is required for ESM imports throughout the project
→  NodeNext module resolution pairs correctly with Node.js 20
→  ts-node-dev handles hot reload — do not use nodemon


## TASK 02
Environment Variables
**Phase: Foundation**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create .env file at the project root (same level as server/) with
all required environment variables. Use placeholder values for now.

Required variables:
  GEMINI_API_KEY=your_key_here
  GEMINI_MODEL=gemini-1.5-flash
  MONGO_URI=mongodb://localhost:27017/jobsearch
  PORT=5000
  CACHE_TTL_JOBS=21600
  CACHE_TTL_GIGS=86400
  CACHE_TTL_RATES=86400

Also create .env.example with the same keys but empty values.
Add .env to .gitignore — create .gitignore if it does not exist.
After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  .env.example is for documentation — shows what vars are needed without exposing values
→  CACHE_TTL values are in seconds — used by cache.service.ts for TTL checks




# Section 2 — Config Layer
MongoDB connection and Gemini SDK initialisation. These are imported by every service.

## TASK 03
config/db.ts — MongoDB Connection
**Phase: Config**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/config/db.ts.

This file must:
  1. Import mongoose and dotenv
  2. Export an async function connectDB()
  3. connectDB() attempts mongoose.connect() using MONGO_URI from env
  4. On success: log "MongoDB connected: jobsearch"
  5. On failure: log the error and exit process with code 1
  6. After successful connect, create both TTL indexes:
       - jobs collection: { fetchedAt: 1 }, expireAfterSeconds: 21600
       - searches collection: { computedAt: 1 }, expireAfterSeconds: 86400
  7. Validate MONGO_URI exists in env before attempting connect.
     If missing: log "Missing MONGO_URI in .env" and exit.

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  TTL indexes are created here once — not in models — to keep models clean
→  Process exit on missing env vars is intentional — fail loud, not silent


## TASK 04
config/gemini.ts — Gemini SDK Init
**Phase: Config**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/config/gemini.ts.

This file must:
  1. Import GoogleGenerativeAI from @google/generative-ai
  2. Validate GEMINI_API_KEY exists in env.
     If missing: log "Missing GEMINI_API_KEY in .env" and exit process.
  3. Instantiate GoogleGenerativeAI with the API key
  4. Call getGenerativeModel() with these exact settings:
       model: process.env.GEMINI_MODEL (gemini-1.5-flash)
       generationConfig:
         temperature: 0.3
         maxOutputTokens: 2048
  5. Export the configured model as a named export: geminiModel
  6. Do not wrap in a function — initialise at module level

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  Temperature 0.3 is critical — higher values cause JSON structure drift
→  Model is exported directly — gemini.service.ts imports and uses it




# Section 3 — Mongoose Models
Define the four MongoDB collections. All types are declared inline in their model files.

## TASK 05
models/Profile.model.ts — Singleton Profile
**Phase: Models**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/models/Profile.model.ts.

Define interface IProfile with these exact fields:
  skills:            string[]       // ordered by proficiency
  seniority:         string         // junior | mid | senior | lead
  yearsExp:          number
  workType:          string         // fulltime | freelance | both
  remote:            string         // remote | hybrid | onsite
  salaryMin:         number         // INR per annum
  salaryMax:         number         // INR per annum
  targetRoles:       string[]
  location:          string
  bio:               string
  contextString:     string         // Chain 1 cached output
  contextBuiltAt:    Date           // when contextString was built

Create Mongoose schema matching the interface.
Add timestamps: true to schema options.
Export both the interface and the model.

IMPORTANT: This is a singleton collection.
Always retrieved and saved with Profile.findOneAndUpdate({}, ...)
The empty filter {} is intentional — there is only one document.

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  contextString and contextBuiltAt are populated by context.service.ts (Chain 1)
→  salaryMin/Max in INR — Gemini uses this for rate calibration


## TASK 06
models/Job.model.ts — Cached Job Listings
**Phase: Models**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/models/Job.model.ts.

Define interface IJob with these exact fields:
  externalId:    string    // unique — remotive_123 or arbeitnow_abc
  source:        string    // "remotive" | "arbeitnow"
  title:         string
  company:       string
  companyLogo:   string    // URL, optional
  description:   string
  tags:          string[]
  salary:        string    // raw string, optional
  isRemote:      boolean
  location:      string
  url:           string    // original apply link
  postedAt:      Date
  matchScore:    number    // 0-100, set by Chain 2, default null
  matchReason:   string    // 1-line from Chain 2, default null
  missingSkills: string[]  // from Chain 2, default []
  verdict:       string    // strong_match | partial_match | weak_match
  fetchedAt:     Date      // TTL index field — set on insert

Create Mongoose schema matching interface.
Set unique: true on externalId field.
Set default: Date.now on fetchedAt.
Add timestamps: true to schema options.
Export both interface and model.

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  fetchedAt TTL index is created in db.ts — not here — keep model clean
→  externalId uniqueness enables safe upsert via bulkWrite in jobFetch.service.ts
→  matchScore/matchReason start as null — populated after Chain 2 runs


## TASK 07
models/Bookmark.model.ts — Application Tracker
**Phase: Models**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/models/Bookmark.model.ts.

Define interface IBookmark with these exact fields:
  jobRef:       mongoose.Types.ObjectId  // ref: Job, optional/nullable
  externalUrl:  string    // ALWAYS store this — jobs expire after 6h
  title:        string    // ALWAYS denormalize — jobs expire after 6h
  company:      string    // ALWAYS denormalize — jobs expire after 6h
  matchScore:   number    // score at time of saving — denormalized
  status:       string    // saved | applied | interview | offer | rejected
  notes:        string    // personal notes
  appliedAt:    Date      // optional — set when status → applied

Create Mongoose schema matching interface.
Set default: "saved" on status field.
Add timestamps: true.
Export both interface and model.

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  externalUrl, title, company MUST be denormalized — jobs are deleted every 6h
→  Without denormalization the kanban board breaks when jobs expire
→  jobRef is nullable to allow manually added bookmarks without a job in DB


## TASK 08
models/Search.model.ts — AI Cache
**Phase: Models**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/models/Search.model.ts.
(This is the ai_cache collection despite the file name.)

Define interface IAiCache with these exact fields:
  cacheKey:    string    // SHA256 hash — unique index
  chainType:   string    // context | jobScore | gigIdeas | rates
  result:      unknown   // parsed JSON from Gemini response
  computedAt:  Date      // TTL index field — set on insert

Create Mongoose schema matching interface.
Set unique: true on cacheKey.
Set default: Date.now on computedAt.
Use mongoose.Schema.Types.Mixed for result field.
Export both interface and model.

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  computedAt TTL index is created in db.ts — not here
→  result is Mixed because each chain returns a different JSON shape
→  cacheKey uniqueness prevents duplicate cache entries for identical inputs




# Section 4 — Prompt Templates
Pure template functions. No business logic. No DB calls. Each exports one builder function that assembles a complete prompt string for its chain.

## TASK 09
prompts/master.prompt.ts — System Prompt
**Phase: Prompts**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/prompts/master.prompt.ts.

Export a single const string named MASTER_SYSTEM_PROMPT.

The string must contain exactly this content (copy verbatim):

"You are a personal career intelligence assistant for a single software
engineer in Hyderabad, India. You have expert knowledge of the tech job
market, freelance platforms, resume writing, and salary benchmarks for
software roles in India and globally for remote work.

You always receive the user profile under [PROFILE_CONTEXT].
Use it to personalise every single response. Never give generic advice.

STRICT RULES — violating these makes your response useless:
1. Respond ONLY in valid JSON. No markdown. No prose outside JSON.
2. Never wrap response in backtick json fences. Raw JSON only.
3. Never hallucinate job listings. Only score data you are given.
4. All salary and rate figures calibrated to Indian market realities.
5. Be specific. Name actual skills. Name actual gaps. Be direct."

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  This string is prepended to EVERY chain prompt in gemini.service.ts
→  The strictness of Rule 2 is intentional — Gemini still adds fences sometimes
→  cache.service.ts strips fences defensively even though we forbid them here


## TASK 10
prompts/jobScore.prompt.ts — Chain 2
**Phase: Prompts**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/prompts/jobScore.prompt.ts.

Export a single function: buildJobScorePrompt(contextString, jobs)
  - contextString: string (from profile.contextString)
  - jobs: array of IJob objects (max 20 per call)
  - returns: string (the complete assembled prompt)

The prompt must instruct Gemini to:
  - Score each job 0-100 against the profile context
  - Consider: skill overlap, seniority fit, remote match, salary alignment
  - Return matchReason as 1 specific sentence naming actual skills/gaps
  - Return missingSkills as array of skill name strings
  - Return verdict: strong_match (80-100) | partial_match (50-79) | weak_match (0-49)

Required JSON output schema to include in prompt:
  { "scores": [ { "jobId": string, "matchScore": number,
    "matchReason": string, "missingSkills": string[],
    "verdict": string } ] }

End the prompt with this exact instruction:
  "Respond ONLY with valid JSON matching the schema above.
   Do NOT include markdown fences, backticks, or any text outside
   the JSON object. Start your response with { and end with }."

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  Batch size of 20 jobs is enforced in gemini.service.ts — not here
→  jobId in the response maps to MongoDB _id — passed in from the jobs array
→  The scoring guide (80-100 strong etc.) must be included in the prompt text


## TASK 11
prompts/gigIdeas.prompt.ts — Chain 3
**Phase: Prompts**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/prompts/gigIdeas.prompt.ts.

Export a single function: buildGigIdeasPrompt(contextString)
  - contextString: string
  - returns: string

The prompt must instruct Gemini to generate 8 freelance gig ideas that:
  - Use at least one of the engineers top skills
  - Are realistically deliverable by one person
  - Have genuine market demand in 2024-2025
  - Are titled exactly as they would appear on the platform

Required JSON output schema:
  { "gigs": [ { "title": string, "platform": string,
    "platformCategory": string, "primarySkill": string,
    "estimatedDemand": "high"|"medium"|"low",
    "estimatedEarningsPerProject": { "min": number, "max": number },
    "whyThisUser": string, "searchUrl": string } ] }

End the prompt with the standard JSON-only instruction.
After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  searchUrl must be a real pre-built URL pointing to the platform search
→  whyThisUser must reference specific skills from the profile — not generic


## TASK 12
prompts/rateEstimate.prompt.ts — Chain 4
**Phase: Prompts**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/prompts/rateEstimate.prompt.ts.

Export a single function: buildRatePrompt(contextString)
  - contextString: string
  - returns: string

The prompt must instruct Gemini to estimate rates for:
  - Indian freelancers working with international clients (USD)
  - Indian freelancers working with domestic clients (INR)
  - Based on seniority, years of experience, and current 2024-2025 market

Required JSON output schema:
  { "blendedRate": {
      "hourlyUSD": { "min": number, "max": number },
      "hourlyINR": { "min": number, "max": number },
      "monthlyINR": { "min": number, "max": number },
      "rationale": string
    },
    "bySkill": [ { "skill": string,
      "hourlyUSD": { "min": number, "max": number },
      "demandTrend": "rising"|"stable"|"falling",
      "marketNote": string, "monetisationTip": string } ],
    "positioningAdvice": string }

End the prompt with the standard JSON-only instruction.
After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  positioningAdvice is 2-3 sentences on how to command the higher rate range
→  bySkill should cover top 5 skills from the profile context


## TASK 13
prompts/bulletRewrite.prompt.ts — Chain 5
**Phase: Prompts**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/prompts/bulletRewrite.prompt.ts.

Export a single function: buildBulletPrompt(contextString, jobDescription, originalBullet)
  - All three params are strings
  - returns: string

The prompt must instruct Gemini to rewrite the bullet so it:
  1. Starts with a strong past-tense action verb
  2. Includes a measurable outcome — infer one if not in the original
  3. Mirrors 1-2 keywords from the job description naturally
  4. Is maximum 20 words total
  5. Uses only technologies already in the users profile

Required JSON output schema:
  { "rewritten": string, "actionVerb": string,
    "keywordsMatched": string[], "metricAdded": boolean,
    "improvementNote": string }

End the prompt with the standard JSON-only instruction.
After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  No caching for this chain — results are too context-specific to reuse
→  improvementNote is 1 sentence explaining the single biggest change made


## TASK 14
prompts/coverLetter.prompt.ts — Chain 6
**Phase: Prompts**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/prompts/coverLetter.prompt.ts.

Export a single function: buildCoverLetterPrompt(contextString, job)
  - contextString: string
  - job: IJob object
  - returns: string

The prompt must instruct Gemini to write a cover letter with:
  Para 1: Why this specific company/role — reference something real from the JD
  Para 2: 2-3 specific skills from profile matching job requirements
  Para 3: Brief close — availability and enthusiasm, no clichés

Tone rules to include in prompt:
  - Never open with "I am writing to express my interest"
  - Confident, not arrogant. Direct, not desperate.
  - Sounds like a human wrote it

Required JSON output schema:
  { "subject": string, "body": string,
    "wordCount": number, "keySellingPoints": string[],
    "redFlags": string[] }

redFlags = skills in JD the user may be underqualified for.
End the prompt with the standard JSON-only instruction.
After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  No caching for this chain — always fresh per job application
→  redFlags is genuinely useful — tells the user what to address in the letter




# Section 5 — Services
Core business logic. Build in this exact order — each service depends on the previous.

## TASK 15
services/cache.service.ts — Cache Layer
**Phase: Services**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/services/cache.service.ts.

Import: crypto (built-in), Search model, IAiCache interface.

Export these three functions:

1. buildCacheKey(chainType: string, inputs: unknown): string
   - Creates SHA256 hash of chainType + JSON.stringify(inputs)
   - Returns hex digest string
   - JSDoc: @param chainType @param inputs @returns SHA256 hex string

2. getCache(cacheKey: string, ttlMs: number): Promise<unknown | null>
   - Finds document in Search collection by cacheKey
   - Checks if computedAt is within ttlMs milliseconds of now
   - Returns result if fresh, null if expired or not found
   - JSDoc with @param and @returns

3. setCache(cacheKey: string, chainType: string, result: unknown): Promise<void>
   - Upserts document into Search collection
   - Sets computedAt to new Date()
   - JSDoc with @param descriptions

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  TTL is checked in code here — not relying solely on MongoDB TTL index
→  MongoDB TTL index handles physical deletion. Code TTL handles freshness logic.
→  inputs as unknown allows any shape — the hash just needs a stable string


## TASK 16
services/gemini.service.ts — Central AI Orchestrator
**Phase: Services**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/services/gemini.service.ts.

Import: geminiModel from config/gemini.ts,
        buildCacheKey, getCache, setCache from cache.service.ts,
        MASTER_SYSTEM_PROMPT from prompts/master.prompt.ts

Export one main function:

callGemini(userPrompt: string, chainType: string,
           cacheInputs: unknown, ttlMs: number): Promise<unknown>

The function must follow this exact sequence:
  1. Build cacheKey = buildCacheKey(chainType, cacheInputs)
  2. Call getCache(cacheKey, ttlMs)
  3. If cache hit: return cached result immediately (log "cache hit: chainType")
  4. If cache miss:
     a. Assemble full prompt: MASTER_SYSTEM_PROMPT + newline + userPrompt
     b. Call geminiModel.generateContent(fullPrompt)
     c. Extract text = response.response.text()
     d. Strip markdown fences: remove ```json and ``` from start/end
     e. Call JSON.parse(cleanedText)
     f. On parse success: call setCache(cacheKey, chainType, parsed)
     g. Return parsed result
     h. On parse failure: log raw text, throw { code: GEMINI_PARSE_ERROR, raw: text }

Wrap everything in try/catch. Never crash the process.
After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  This is the single entry point for ALL Gemini calls — no other file calls the SDK
→  Fence stripping is defensive — the master prompt forbids fences but Gemini adds them anyway
→  Log cache hits — useful to verify quota is being protected during development


## TASK 17
services/context.service.ts — Chain 1
**Phase: Services**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/services/context.service.ts.

Import: Profile model, callGemini from gemini.service.ts,
        buildContextPrompt from prompts/ (create this prompt inline here
        OR import from a separate file — your choice, but keep it clean)

Export one function:

buildProfileContext(): Promise<string>

The function must:
  1. Load the single profile document from MongoDB
  2. If no profile exists: throw { code: PROFILE_NOT_FOUND }
  3. Check contextBuiltAt — if it exists and is less than 1 hour old
     (Date.now() - contextBuiltAt.getTime() < 3_600_000):
     return profile.contextString immediately (no Gemini call)
  4. If expired or missing:
     a. Build prompt: instruct Gemini to summarise the profile JSON
        into a dense 200-word context string
     b. Required JSON output schema:
        { "contextString": string, "topSkills": string[],
          "seniorityLabel": string, "salaryRange": object,
          "preferredWorkType": string }
     c. Call callGemini(prompt, "context", { profileId }, 3_600_000)
     d. Save result.contextString and new contextBuiltAt to profile doc
     e. Return result.contextString

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  TTL constant 3_600_000ms = 1 hour — defined as a const at top of file
→  profileId is used as cacheInput so hash changes if profile _id changes
→  This runs on every GET /api/profile/context — fast if cache is warm


## TASK 18
services/jobFetch.service.ts — External Data
**Phase: Services**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/services/jobFetch.service.ts.

Import: axios, Job model, IJob interface.

Export these functions:

1. fetchRemotive(): Promise<Partial<IJob>[]>
   GET https://remotive.com/api/remote-jobs?category=software-dev&limit=50
   Map response.jobs to IJob shape using the field mapping in AGENTS.md
   Prefix externalId with "remotive_"
   Always set isRemote: true and source: "remotive"

2. fetchArbeitNow(): Promise<Partial<IJob>[]>
   GET https://www.arbeitnow.com/api/job-board-api
   Map response.data to IJob shape using AGENTS.md field mapping
   Prefix externalId with "arbeitnow_"
   Set source: "arbeitnow"

3. fetchAndUpsertAll(): Promise<number>
   Call both fetch functions
   Combine results
   Set fetchedAt: new Date() on every job
   Use Job.bulkWrite() with updateOne + upsert: true filtering on externalId
   Log how many jobs were upserted
   Return the total count

All three functions wrapped in try/catch. Log errors clearly.
After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  bulkWrite with upsert prevents duplicates on repeated fetches
→  fetchedAt is set fresh on every upsert — resets the TTL clock
→  If Remotive or Arbeit Now is down, log and continue — do not throw




# Section 6 — Express Routes
All routes follow the same pattern: validate input, call service, return response envelope. No business logic lives in routes.

## TASK 19
routes/profile.routes.ts
**Phase: Routes**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/routes/profile.routes.ts.

Create an Express Router and export it.

Implement these 3 routes:

GET /profile
  - Call Profile.findOne({})
  - Return { success: true, data: profile }
  - If no profile: return { success: true, data: null }

PATCH /profile
  - Accept any profile fields in request body
  - Call Profile.findOneAndUpdate({}, req.body, { upsert: true, new: true })
  - Invalidate contextString by setting contextBuiltAt to null on update
  - Return { success: true, data: updatedProfile }

GET /profile/context
  - Call buildProfileContext() from context.service.ts
  - Return { success: true, data: { contextString } }

All handlers async. All wrapped in try/catch.
Errors returned as { success: false, error: { code, message } }
After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  PATCH invalidates contextString so next context request triggers a rebuild
→  GET /profile/context is the entry point for Chain 1 from the frontend


## TASK 20
routes/jobs.routes.ts
**Phase: Routes**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/routes/jobs.routes.ts.

Create an Express Router and export it.

Implement these 3 routes:

GET /jobs
  - Fetch all jobs from MongoDB sorted by matchScore descending
  - Return { success: true, data: { jobs, count } }

POST /jobs/refresh
  - Call fetchAndUpsertAll() from jobFetch.service.ts
  - Then batch unscored jobs (matchScore == null) in groups of 20
  - For each batch: build context, call callGemini with jobScore chain
  - Update each job with returned matchScore, matchReason, missingSkills, verdict
  - Return { success: true, data: { fetched, scored } }

POST /jobs/score
  - Body: { jobIds: string[] }
  - Validate jobIds is a non-empty array
  - Fetch those specific jobs from MongoDB
  - Load context string from profile
  - Call callGemini with jobScore prompt, batch size 20
  - Update jobs with scores
  - Return { success: true, data: { scored: number } }

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  Score batching in groups of 20 keeps Gemini token usage within limits
→  POST /jobs/refresh is also called by the cron job in feedRefresh.cron.ts


## TASK 21
routes/freelance.routes.ts
**Phase: Routes**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/routes/freelance.routes.ts.

Create an Express Router and export it.

Implement these 2 routes:

GET /freelance/ideas
  - Load contextString from profile (call buildProfileContext)
  - Call callGemini with gigIdeas prompt, chainType: "gigIdeas",
    cacheInputs: { contextString }, ttlMs: 86_400_000
  - Return { success: true, data: result }

GET /freelance/rates
  - Load profile to get topSkills, seniorityLabel, yearsExp
  - Load contextString
  - Call callGemini with rateEstimate prompt, chainType: "rates",
    cacheInputs: { topSkills, seniorityLabel, yearsExp }, ttlMs: 86_400_000
  - Return { success: true, data: result }

Both routes async, try/catch, response envelope.
After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  86_400_000ms = 24 hours — gig ideas and rates do not change daily
→  cacheInputs for rates uses actual skills/seniority — not contextString —
→  so cache invalidates if those specific fields change


## TASK 22
routes/resume.routes.ts
**Phase: Routes**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/routes/resume.routes.ts.

Create an Express Router and export it.

Implement these 2 routes:

POST /resume/rewrite
  - Body: { bullet: string, jobDescription: string }
  - Validate both fields are present and non-empty strings
  - If missing: return 400 { success: false, error: { code: MISSING_FIELDS } }
  - Load contextString from profile
  - Call callGemini with bulletRewrite prompt
  - No caching — pass ttlMs: 0 or skip cache for this chain
  - Return { success: true, data: result }

POST /resume/coverletter
  - Body: { job: IJob }
  - Validate job object has title and description
  - Load contextString from profile
  - Call callGemini with coverLetter prompt
  - No caching for this chain
  - Return { success: true, data: result }

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  These two chains are never cached — inputs are too unique per request
→  For no-cache: pass a ttlMs of 0 so getCache always returns null


## TASK 23
routes/assistant.routes.ts + Bookmarks
**Phase: Routes**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/routes/assistant.routes.ts.

Implement 1 route:

POST /assistant/chat
  - Body: { messages: Array<{ role: string, content: string }> }
  - Validate messages is a non-empty array
  - Load contextString from profile
  - Build prompt: MASTER_SYSTEM_PROMPT + contextString + conversation history
  - Instruct Gemini to respond in JSON:
    { "reply": string, "suggestedFollowUps": string[] }
  - No caching — conversation is always unique
  - Return { success: true, data: result }

─────────────────────────────────────────

ALSO in this same task — create bookmark routes in jobs.routes.ts
(add them to the existing jobs router OR create a separate bookmarks router
and mount it — your choice, stay within existing file structure):

GET    /bookmarks          → all bookmarks sorted by createdAt desc
POST   /bookmarks          → body: { jobRef?, externalUrl, title, company, matchScore }
                             validate externalUrl, title, company present
PATCH  /bookmarks/:id      → body: { status?, notes?, appliedAt? }
DELETE /bookmarks/:id      → hard delete, return { success: true }

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  Assistant context = MASTER_SYSTEM_PROMPT + contextString + full message history
→  suggestedFollowUps renders as quick-reply buttons in the frontend later
→  Bookmark PATCH allows status drag-drop from the kanban board




# Section 7 — Middleware, Cron & Entry Point
Final wiring. After this section the server boots and every endpoint is live.

## TASK 24
middleware/rateLimiter.ts
**Phase: Middleware**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/middleware/rateLimiter.ts.

Import express-rate-limit.

Export a configured rate limiter middleware:
  windowMs: 60 * 1000  (1 minute)
  max: 15              (15 requests per minute)
  standardHeaders: true
  legacyHeaders: false
  handler: (req, res) => res.status(429).json({
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Wait 60 seconds."
    }
  })

This middleware is applied to all /api/* routes in index.ts.
After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  Gemini free tier allows 15 requests per minute — this enforces that exactly
→  standardHeaders sends RateLimit-* headers so the client knows when to retry


## TASK 25
jobs/feedRefresh.cron.ts — Scheduled Feed
**Phase: Cron**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/jobs/feedRefresh.cron.ts.

Import node-cron, fetchAndUpsertAll from jobFetch.service.ts,
       callGemini from gemini.service.ts,
       buildJobScorePrompt from prompts/jobScore.prompt.ts,
       Job model, buildProfileContext from context.service.ts.

Export a function startFeedRefreshCron() that:
  Schedules a cron with pattern "0 */6 * * *" (every 6 hours)

  On each run:
  1. Log "Feed refresh started: <timestamp>"
  2. Call fetchAndUpsertAll() — log count returned
  3. Find all jobs where matchScore is null
  4. Batch them into groups of 20
  5. Load contextString from buildProfileContext()
  6. For each batch: call callGemini with jobScore prompt
  7. For each score in response: update matching Job document
     with matchScore, matchReason, missingSkills, verdict
  8. Log "Feed refresh complete: X fetched, Y scored"

Wrap entire cron function body in try/catch.
Never throw from inside a cron — catch and log only.
After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  "0 */6 * * *" runs at minute 0 of every 6th hour: 00:00, 06:00, 12:00, 18:00
→  Catching silently inside cron prevents crashing the server on API downtime


## TASK 26
server/index.ts — Entry Point
**Phase: Entry Point**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Create server/src/index.ts.

This is the application entry point. Wire everything together.

In order:
  1. Import dotenv and call dotenv.config() — FIRST LINE
  2. Import express, cors
  3. Import connectDB from config/db.ts
  4. Import rateLimiter from middleware/rateLimiter.ts
  5. Import all 5 route files
  6. Import startFeedRefreshCron from jobs/feedRefresh.cron.ts

  7. Create Express app
  8. Apply middleware in this order:
       app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }))
       app.use(express.json())
       app.use("/api", rateLimiter)

  9. Mount routes:
       app.use("/api/profile", profileRoutes)
       app.use("/api/jobs", jobRoutes)
       app.use("/api/freelance", freelanceRoutes)
       app.use("/api/resume", resumeRoutes)
       app.use("/api/assistant", assistantRoutes)

  10. Add a health check: GET /health → { status: "ok", timestamp: Date.now() }

  11. Start server:
        connectDB().then(() => {
          app.listen(PORT, () => log("Server running on port PORT"))
          startFeedRefreshCron()
        })

After completing, update PROJECT_STATE.md.
### ARCHITECT NOTES
→  dotenv.config() must be called before any other import reads process.env
→  CORS whitelist covers both Vite dev (5173) and CRA dev (3000)
→  rateLimiter applied to /api only — health check is unthrottled
→  startFeedRefreshCron() starts after DB connects — not before


## TASK 27
Final Verification — Boot Test
**Phase: Verification**

**PASTE THIS EXACT PROMPT INTO ANTIGRAVITY MANAGER VIEW:**
```text
Run npm install in the server/ directory.

Then run: npm run dev

Verify these things one by one:

1. Server starts without TypeScript errors
2. MongoDB connects — log shows "MongoDB connected: jobsearch"
3. TTL indexes are created without errors
4. Cron job registers without errors
5. GET http://localhost:5000/health returns { status: "ok" }
6. GET http://localhost:5000/api/profile returns { success: true, data: null }
7. PATCH http://localhost:5000/api/profile with body
   { "skills": ["React","Node"], "seniority": "mid", "yearsExp": 3,
     "workType": "both", "remote": "remote", "salaryMin": 600000,
     "salaryMax": 1200000, "targetRoles": ["Full Stack Developer"],
     "location": "Hyderabad, India", "bio": "Test bio" }
   returns { success: true, data: { ...profile } }
8. GET http://localhost:5000/api/profile/context
   triggers Chain 1 and returns { success: true, data: { contextString: "..." } }
9. GET http://localhost:5000/api/jobs returns { success: true, data: { jobs: [] } }

If any step fails: fix it before marking this task complete.
After all steps pass, update PROJECT_STATE.md with status: PHASE 1 COMPLETE.
### ARCHITECT NOTES
→  Step 8 requires a real GEMINI_API_KEY in .env — add yours before this task
→  Phase 1 is complete when all 9 verification steps pass
→  Phase 2 (React frontend) begins after this task is marked complete




Phase 1 Complete.
All 27 tasks done → PROJECT_STATE.md updated → server boots → all endpoints respond.
Next: Phase 2 — React Frontend
