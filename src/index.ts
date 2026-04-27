import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import rateLimiter from './middleware/rateLimiter.js'
import profileRoutes from './routes/profile.routes.js'
import jobRoutes from './routes/jobs.routes.js'
import freelanceRoutes from './routes/freelance.routes.js'
import resumeRoutes from './routes/resume.routes.js'
import assistantRoutes from './routes/assistant.routes.js'
import { startFeedRefreshCron } from './jobs/feedRefresh.cron.js'

const PORT = process.env['PORT'] ?? '5000'

const app = express()

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }))
app.use(express.json())
app.use('/api', rateLimiter)

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/profile', profileRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/freelance', freelanceRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/assistant', assistantRoutes)

// ─── Health check — unthrottled ───────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// ─── Boot ─────────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
  startFeedRefreshCron()
})