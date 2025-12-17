import { z } from 'zod'

// Creation schema: title required, description optional, is_public optional
export const createCollectionSchema = z.object({
  title: z
    .string({ required_error: 'Titre requis' })
    .trim()
    .min(1, 'Titre requis')
    .max(100, 'Titre trop long (max 100)'),
  description: z
    .string()
    .trim()
    .max(500, 'Description trop longue (max 500)')
    .optional(),
  is_public: z.boolean().optional(),
})

// Update schema: at least one field provided
export const updateCollectionSchema = z
  .object({
    title: z.string().trim().min(1, 'Titre requis').max(100, 'Titre trop long (max 100)').optional(),
    description: z.string().trim().max(500, 'Description trop longue (max 500)').optional(),
    is_public: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Aucune modification fournie',
    path: [],
  })

// Optional: params schema if needed elsewhere
export const collectionIdParamSchema = z.object({
  id: z.string().uuid('Identifiant invalide'),
})
