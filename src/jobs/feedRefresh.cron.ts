import cron from 'node-cron'
import { fetchAndUpsertAll } from '../services/jobFetch.service.js'
import { Job } from '../models/Job.model.js'
import { buildProfileContext } from '../services/context.service.js'
import { scoreBatched } from '../controllers/jobs.controller.js'
import type { IJob } from '../models/Job.model.js'

/**
 * Starts the scheduled feed refresh cron job.
 * Runs every 6 hours (at 00:00, 06:00, 12:00, 18:00).
 * Fetches jobs from all sources, scores any unscored jobs.
 * Never throws from inside the cron — catch and log only.
 */
export function startFeedRefreshCron(): void {
  cron.schedule('0 */6 * * *', async () => {
    const timestamp = new Date().toISOString()
    console.log(`Feed refresh started: ${timestamp}`)

    try {
      const fetched = await fetchAndUpsertAll()
      console.log(`Feed refresh: ${fetched} jobs upserted/updated`)

      const unscoredJobs = await Job.find({ matchScore: null }) as IJob[]
      let scored = 0

      if (unscoredJobs.length > 0) {
        const contextString = await buildProfileContext()
        scored = await scoreBatched(unscoredJobs, contextString)
      }

      console.log(`Feed refresh complete: ${fetched} fetched, ${scored} scored`)
    } catch (err) {
      console.error('Feed refresh cron error:', err)
      // Never re-throw from cron — catch and log only
    }
  })

  console.log('Feed refresh cron registered: runs every 6 hours (0 */6 * * *)')
}
