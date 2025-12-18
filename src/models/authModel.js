import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password too short.'),
  first_name: z.string().min(1, 'First name required.').max(30),
  last_name: z.string().min(1, 'Last name required.').max(50),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
})
