import { Router } from 'express'
import { currentUser, login, register } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { loginSchema, registerSchema } from '../models/authModel.js'

const router = Router()

router.post('/register', validateBody(registerSchema), register)
router.post('/login', validateBody(loginSchema), login)
router.get('/me', authenticate, currentUser)

export default router
