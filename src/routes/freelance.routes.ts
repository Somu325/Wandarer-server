import { Router } from 'express'
import { getIdeas, getRates } from '../controllers/freelance.controller.js'

const router = Router()

router.get('/ideas', getIdeas)
router.get('/rates', getRates)

export default router
