import { Router } from 'express'
import { rewriteBullet, generateCoverLetter } from '../controllers/resume.controller.js'

const router = Router()

router.post('/rewrite', rewriteBullet)
router.post('/coverletter', generateCoverLetter)

export default router
