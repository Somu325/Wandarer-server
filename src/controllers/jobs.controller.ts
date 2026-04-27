import type { Request, Response } from 'express'
import { Job } from '../models/Job.model.js'
import { fetchAndUpsertAll } from '../services/jobFetch.service.js'
import { buildProfileContext } from '../services/context.service.js'
import { callGemini } from '../services/gemini.service.js'
import { buildJobScorePrompt } from '../prompts/jobScore.prompt.js'
import type { IJob } from '../models/Job.model.js'

const BATCH = 20
const JOB_SCORE_TTL = 21_600_000

/**
 * Shared helper — scores a list of jobs in batches of 20 against the current profile context.
 * Updates each job in MongoDB with matchScore, matchReason, missingSkills, verdict.
 * @returns number of jobs scored
 */
async function scoreBatched(jobs: IJob[], contextString: string): Promise<number> {
  let scored = 0
  for (let i = 0; i < jobs.length; i += BATCH) {
    const batch = jobs.slice(i, i + BATCH)
    const prompt = buildJobScorePrompt(contextString, batch)
    const result = await callGemini(
      prompt,
      'jobScore',
      { jobIds: batch.map((j) => (j._id as { toString(): string }).toString()) },
      JOB_SCORE_TTL
    ) as { scores: { jobId: string; matchScore: number; matchReason: string; missingSkills: string[]; verdict: string }[] }

    for (const score of result.scores) {
      await Job.findByIdAndUpdate(score.jobId, {
        matchScore: score.matchScore,
        matchReason: score.matchReason,
        missingSkills: score.missingSkills,
        verdict: score.verdict,
      })
      scored++
    }
  }
  return scored
}

/**
 * GET /api/jobs
 * Returns all jobs sorted by matchScore descending (unscored jobs last).
 */
export async function getJobs(_req: Request, res: Response): Promise<void> {
  try {
    const jobs = await Job.find({}).sort({ matchScore: -1 })
    res.json({ success: true, data: { jobs, count: jobs.length } })
  } catch (err) {
    console.error('getJobs error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch jobs' } })
  }
}

/**
 * POST /api/jobs/refresh
 * Fetches all jobs from external APIs, upserts to DB, then scores any unscored jobs.
 */
export async function refreshJobs(_req: Request, res: Response): Promise<void> {
  try {
    const fetched = await fetchAndUpsertAll()
    const unscoredJobs = await Job.find({ matchScore: null }) as IJob[]
    let scored = 0

    if (unscoredJobs.length > 0) {
      const contextString = await buildProfileContext()
      scored = await scoreBatched(unscoredJobs, contextString)
    }

    res.json({ success: true, data: { fetched, scored } })
  } catch (err) {
    console.error('refreshJobs error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Feed refresh failed' } })
  }
}

/**
 * POST /api/jobs/score
 * Scores a specific set of jobs by their MongoDB IDs.
 * Body: { jobIds: string[] }
 */
export async function scoreJobs(req: Request, res: Response): Promise<void> {
  try {
    const { jobIds } = req.body as { jobIds: unknown }

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'jobIds must be a non-empty array' } })
      return
    }

    const jobs = await Job.find({ _id: { $in: jobIds } }) as IJob[]
    if (jobs.length === 0) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No jobs found for the given IDs' } })
      return
    }

    const contextString = await buildProfileContext()
    const scored = await scoreBatched(jobs, contextString)
    res.json({ success: true, data: { scored } })
  } catch (err) {
    console.error('scoreJobs error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Job scoring failed' } })
  }
}
