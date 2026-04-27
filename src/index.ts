import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import rateLimiter from './middleware/rateLimiter.js'
import { requestLogger } from './middleware/logger.js'
import profileRoutes from './routes/profile.routes.js'
import jobRoutes from './routes/jobs.routes.js'
import freelanceRoutes from './routes/freelance.routes.js'
import resumeRoutes from './routes/resume.routes.js'
import assistantRoutes from './routes/assistant.routes.js'
import { startFeedRefreshCron } from './jobs/feedRefresh.cron.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env['PORT'] ?? '5000'

const app = express()

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors()) // Simplified for combined deployment
app.use(express.json())
app.use(requestLogger)
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

// ─── Static Assets (Frontend) ─────────────────────────────────────────────────
const clientDist = path.join(__dirname, '../public')
app.use(express.static(clientDist))

// ─── SPA Fallback ─────────────────────────────────────────────────────────────
app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'API route not found' } })
    }
    res.sendFile(path.join(clientDist, 'index.html'))
})

// ─── Boot ─────────────────────────────────────────────────────────────────────
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
    startFeedRefreshCron()
})