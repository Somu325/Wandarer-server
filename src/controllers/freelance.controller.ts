import type { Request, Response } from 'express'
import { Profile } from '../models/Profile.model.js'
import { buildProfileContext } from '../services/context.service.js'
import { callGemini } from '../services/gemini.service.js'
import { buildGigIdeasPrompt } from '../prompts/gigIdeas.prompt.js'
import { buildRatePrompt } from '../prompts/rateEstimate.prompt.js'

/**
 * GET /api/freelance/ideas
 * Triggers Chain 3 — returns 8 freelance gig ideas tailored to the profile.
 * Cached 24 hours using contextString as cache input.
 */
export async function getIdeas(_req: Request, res: Response): Promise<void> {
  try {
    const contextString = await buildProfileContext()
    const prompt = buildGigIdeasPrompt(contextString)
    const result = await callGemini(prompt, 'gigIdeas', { contextString }, 86_400_000)
    res.json({ success: true, data: result })
  } catch (err) {
    const e = err as { code?: string; message?: string }
    if (e.code === 'PROFILE_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'PROFILE_NOT_FOUND', message: e.message ?? 'Profile not found' } })
      return
    }
    console.error('getIdeas error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to generate gig ideas' } })
  }
}

/**
 * GET /api/freelance/rates
 * Triggers Chain 4 — returns rate estimates for international and domestic clients.
 * Cached 24 hours using topSkills, seniority, yearsExp as cache inputs.
 */
export async function getRates(_req: Request, res: Response): Promise<void> {
  try {
    const profile = await Profile.findOne({})
    if (!profile) {
      res.status(404).json({ success: false, error: { code: 'PROFILE_NOT_FOUND', message: 'No profile found. Create one via PATCH /api/profile.' } })
      return
    }

    const contextString = await buildProfileContext()
    const prompt = buildRatePrompt(contextString)

    // Cache keyed on specific fields so it busts when these change, not the full context
    const topSkills = [
      ...(profile.skills?.frontend ?? []),
      ...(profile.skills?.backend ?? []),
    ].slice(0, 6)

    const cacheInputs = {
      topSkills,
      seniorityLabel: profile.seniority,
      yearsExp: profile.yearsExp,
    }

    const result = await callGemini(prompt, 'rates', cacheInputs, 86_400_000)
    res.json({ success: true, data: result })
  } catch (err) {
    const e = err as { code?: string; message?: string }
    if (e.code === 'PROFILE_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'PROFILE_NOT_FOUND', message: e.message ?? 'Profile not found' } })
      return
    }
    console.error('getRates error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to generate rate estimates' } })
  }
}
