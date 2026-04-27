import type { Request, Response } from 'express'
import { Profile } from '../models/Profile.model.js'
import { buildProfileContext } from '../services/context.service.js'

const VALID_SECTIONS = [
  'personalInfo',
  'summary',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
  'aiSettings',
] as const

type Section = (typeof VALID_SECTIONS)[number]

/**
 * GET /api/profile
 * Returns the singleton profile document, or null if none exists yet.
 */
export async function getProfile(_req: Request, res: Response): Promise<void> {
  try {
    const profile = await Profile.findOne({})
    res.json({ success: true, data: profile ?? null })
  } catch (err) {
    console.error('getProfile error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch profile' } })
  }
}

/**
 * PATCH /api/profile
 * Upserts any profile fields from request body (full or partial update).
 * Always invalidates contextBuiltAt so next context call rebuilds.
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const update = { ...req.body, contextBuiltAt: null }
    const updated = await Profile.findOneAndUpdate(
      {},
      update,
      { upsert: true, new: true, runValidators: true }
    )
    res.json({ success: true, data: updated })
  } catch (err) {
    console.error('updateProfile error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update profile' } })
  }
}

/**
 * PATCH /api/profile/section/:section
 * Granular update for a single section of the profile.
 * Send the section data directly in the request body.
 *
 * Valid sections: personalInfo | summary | skills | experience |
 *                 projects | education | certifications | aiSettings
 *
 * For aiSettings, body fields: seniority, yearsExp, workType, remote,
 *   salaryMin, salaryMax, targetRoles
 * For all other sections, body is the new value for that section directly.
 */
export async function updateSection(req: Request, res: Response): Promise<void> {
  try {
    const { section } = req.params as { section: string }

    if (!VALID_SECTIONS.includes(section as Section)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SECTION',
          message: `Invalid section. Valid sections: ${VALID_SECTIONS.join(', ')}`,
        },
      })
      return
    }

    let update: Record<string, unknown>

    if (section === 'aiSettings') {
      // AI tuning fields are top-level — spread selectively
      const { seniority, yearsExp, workType, remote, salaryMin, salaryMax, targetRoles } = req.body as {
        seniority?: string
        yearsExp?: number
        workType?: string
        remote?: string
        salaryMin?: number
        salaryMax?: number
        targetRoles?: string[]
      }
      update = {
        ...(seniority !== undefined && { seniority }),
        ...(yearsExp !== undefined && { yearsExp }),
        ...(workType !== undefined && { workType }),
        ...(remote !== undefined && { remote }),
        ...(salaryMin !== undefined && { salaryMin }),
        ...(salaryMax !== undefined && { salaryMax }),
        ...(targetRoles !== undefined && { targetRoles }),
        contextBuiltAt: null,
      }
    } else {
      // Replace the entire section with the body
      update = { [section]: req.body, contextBuiltAt: null }
    }

    const updated = await Profile.findOneAndUpdate(
      {},
      update,
      { upsert: true, new: true, runValidators: true }
    )
    res.json({ success: true, data: updated })
  } catch (err) {
    console.error('updateSection error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update profile section' } })
  }
}

/**
 * GET /api/profile/context
 * Triggers Chain 1 — returns the dense context string for this profile.
 * Returns cached value if < 1 hour old.
 */
export async function getContext(_req: Request, res: Response): Promise<void> {
  try {
    const contextString = await buildProfileContext()
    res.json({ success: true, data: { contextString } })
  } catch (err) {
    const e = err as { code?: string; message?: string }
    if (e.code === 'PROFILE_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'PROFILE_NOT_FOUND', message: e.message ?? 'Profile not found' } })
      return
    }
    console.error('getContext error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to build profile context' } })
  }
}
