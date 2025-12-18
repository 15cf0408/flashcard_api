import { z } from 'zod'

// Creation schema: title required, description optional, is_public optional
export const createCollectionSchema = z.object({
  title: z
    .string({ required_error: 'Title required' })
    .trim()
    .min(1, 'Title required')
    .max(100, 'Title too long (max 100)'),
  description: z
    .string()
    .trim()
    .max(500, 'Description too long (max 500)')
    .optional(),
  is_public: z.boolean().optional(),
})

// Update schema: at least one field provided
export const updateCollectionSchema = z
  .object({
    title: z.string().trim().min(1, 'Title required').max(100, 'Title too long (max 100)').optional(),
    description: z.string().trim().max(500, 'Description too long (max 500)').optional(),
    is_public: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'No changes provided',
    path: [],
  })

// Optional: params schema if needed elsewhere
export const collectionIdParamSchema = z.object({
  id: z.string().uuid('Invalid ID'),
})
