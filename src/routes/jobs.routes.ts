import { Router } from 'express'
import { getJobs, refreshJobs, scoreJobs } from '../controllers/jobs.controller.js'
import { getBookmarks, createBookmark, updateBookmark, deleteBookmark } from '../controllers/bookmarks.controller.js'

const router = Router()

// Jobs
router.get('/', getJobs)
router.post('/refresh', refreshJobs)
router.post('/score', scoreJobs)

// Bookmarks
router.get('/bookmarks', getBookmarks)
router.post('/bookmarks', createBookmark)
router.patch('/bookmarks/:id', updateBookmark)
router.delete('/bookmarks/:id', deleteBookmark)

export default router
