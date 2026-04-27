import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Bookmark } from '../models/Bookmark.model.js'

/**
 * GET /api/bookmarks
 * Returns all bookmarks sorted by createdAt descending.
 */
export async function getBookmarks(_req: Request, res: Response): Promise<void> {
  try {
    const bookmarks = await Bookmark.find({}).sort({ createdAt: -1 })
    res.json({ success: true, data: bookmarks })
  } catch (err) {
    console.error('getBookmarks error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch bookmarks' } })
  }
}

/**
 * POST /api/bookmarks
 * Creates a new bookmark. externalUrl, title, and company are required.
 * Body: { jobRef?, externalUrl, title, company, matchScore? }
 */
export async function createBookmark(req: Request, res: Response): Promise<void> {
  try {
    const { jobRef, externalUrl, title, company, matchScore } = req.body as {
      jobRef?: string
      externalUrl?: string
      title?: string
      company?: string
      matchScore?: number
    }

    if (!externalUrl || !title || !company) {
      res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'externalUrl, title, and company are required' } })
      return
    }

    const bookmark = await Bookmark.create({
      jobRef: jobRef ? new mongoose.Types.ObjectId(jobRef) : null,
      externalUrl,
      title,
      company,
      matchScore: matchScore ?? 0,
    })

    res.status(201).json({ success: true, data: bookmark })
  } catch (err) {
    console.error('createBookmark error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create bookmark' } })
  }
}

/**
 * PATCH /api/bookmarks/:id
 * Updates a bookmark's status, notes, or appliedAt.
 * Body: { status?, notes?, appliedAt? }
 */
export async function updateBookmark(req: Request, res: Response): Promise<void> {
  try {
    const { status, notes, appliedAt } = req.body as {
      status?: string
      notes?: string
      appliedAt?: string
    }

    const updated = await Bookmark.findByIdAndUpdate(
      req.params['id'],
      {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(appliedAt !== undefined && { appliedAt: new Date(appliedAt) }),
      },
      { new: true }
    )

    if (!updated) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bookmark not found' } })
      return
    }

    res.json({ success: true, data: updated })
  } catch (err) {
    console.error('updateBookmark error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update bookmark' } })
  }
}

/**
 * DELETE /api/bookmarks/:id
 * Hard deletes a bookmark by ID.
 */
export async function deleteBookmark(req: Request, res: Response): Promise<void> {
  try {
    const deleted = await Bookmark.findByIdAndDelete(req.params['id'])
    if (!deleted) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bookmark not found' } })
      return
    }
    res.json({ success: true, data: null })
  } catch (err) {
    console.error('deleteBookmark error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete bookmark' } })
  }
}
