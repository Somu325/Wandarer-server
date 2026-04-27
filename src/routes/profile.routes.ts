import { Router } from 'express'
import { getProfile, updateProfile, updateSection, getContext } from '../controllers/profile.controller.js'

const router = Router()

router.get('/', getProfile)
router.patch('/', updateProfile)
router.patch('/section/:section', updateSection)
router.get('/context', getContext)

export default router
