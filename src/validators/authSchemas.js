import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Mot de passe trop court'),
  first_name: z.string().min(1, 'Prenom requis').max(30),
  last_name: z.string().min(1, 'Nom requis').max(50),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Mot de passe requis'),
})
