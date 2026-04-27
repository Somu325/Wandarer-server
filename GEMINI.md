# GEMINI.md
# Antigravity-specific rules — highest priority
# Overrides AGENTS.md on any conflict
# Personal Job & Freelance Intelligence App

---

## CURRENT BUILD PHASE

Backend only. Phase 1.
Do not create, mention, or scaffold any frontend files, React components,
Vite config, or client-side code. That is Phase 2.
The folder structure already exists on disk. Read it before touching anything.

---

## LANGUAGE

TypeScript only. .ts files only. No exceptions.
strict: true. No implicit any. No explicit any either.

---

## AGENT BEHAVIOUR IN ANTIGRAVITY

- Always use Review-driven development mode
- Always generate a Plan Artifact before writing any code
- The plan must list: files to modify, logic to implement, edge cases to handle
- Wait for approval on the plan before proceeding
- Never use Fast mode unless explicitly told to for a specific task

---

## STACK — EXACT

```
express
mongoose
@google/generative-ai
express-rate-limit
node-cron
dotenv
cors
axios
typescript (dev)
ts-node-dev (dev)
@types/express @types/node @types/cors @types/node-cron (dev)
```

Do not install: passport, jwt, bcrypt, nodemon, any auth library,
any frontend library, any logging framework.
Use ts-node-dev for development. Not nodemon. Not ts-node alone.

---

## GEMINI API

Model: gemini-1.5-flash
Temperature: 0.3
maxOutputTokens: 2048
All calls through gemini.service.ts only.
Strip markdown fences before JSON.parse.
Structured error on parse failure — never crash.

---

## WHAT THIS APP WILL NEVER HAVE

No auth. No users collection. No login. No JWT.
No frontend in this phase. No deployment config yet.
No extra folders. No extra files.
No pagination — max 50 jobs filtered in memory on the frontend later.

---

## AFTER EVERY TASK

Update PROJECT_STATE.md before closing the task.
This is not optional.