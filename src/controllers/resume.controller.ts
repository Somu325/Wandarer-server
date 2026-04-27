import type { Request, Response } from 'express'
import { buildProfileContext } from '../services/context.service.js'
import { callGemini } from '../services/gemini.service.js'
import { buildBulletPrompt } from '../prompts/bulletRewrite.prompt.js'
import { buildCoverLetterPrompt } from '../prompts/coverLetter.prompt.js'
import type { IJob } from '../models/Job.model.js'

/**
 * POST /api/resume/rewrite
 * Rewrites a single resume bullet for the given job description via Chain 5.
 * Not cached — inputs are too unique per request.
 * Body: { bullet: string, jobDescription: string }
 */
export async function rewriteBullet(req: Request, res: Response): Promise<void> {
  try {
    const { bullet, jobDescription } = req.body as { bullet?: string; jobDescription?: string }

    if (!bullet || typeof bullet !== 'string' || bullet.trim() === '') {
      res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'bullet is required and must be a non-empty string' } })
      return
    }
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
      res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'jobDescription is required and must be a non-empty string' } })
      return
    }

    const contextString = await buildProfileContext()
    const prompt = buildBulletPrompt(contextString, jobDescription, bullet)
    const result = await callGemini(prompt, 'bulletRewrite', {}, 0)
    res.json({ success: true, data: result })
  } catch (err) {
    const e = err as { code?: string; message?: string }
    if (e.code === 'PROFILE_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'PROFILE_NOT_FOUND', message: e.message ?? 'Profile not found' } })
      return
    }
    console.error('rewriteBullet error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Bullet rewrite failed' } })
  }
}

/**
 * POST /api/resume/coverletter
 * Generates a tailored cover letter for a given job via Chain 6.
 * Not cached — always fresh per job application.
 * Body: { job: IJob }
 */
export async function generateCoverLetter(req: Request, res: Response): Promise<void> {
  try {
    const { job } = req.body as { job?: Partial<IJob> }

    if (!job || !job.title || !job.description) {
      res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'job object with title and description is required' } })
      return
    }

    const contextString = await buildProfileContext()
    const prompt = buildCoverLetterPrompt(contextString, job as IJob)
    const result = await callGemini(prompt, 'coverLetter', {}, 0)
    res.json({ success: true, data: result })
  } catch (err) {
    const e = err as { code?: string; message?: string }
    if (e.code === 'PROFILE_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'PROFILE_NOT_FOUND', message: e.message ?? 'Profile not found' } })
      return
    }
    console.error('generateCoverLetter error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Cover letter generation failed' } })
  }
}
