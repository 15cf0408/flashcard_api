import { z } from 'zod';


export const createFlashCardSchema = z.object({
    textFront: z.string()
        .min(1, 'Le text avant doit au moins avoir 1 caractère')
        .max(510, 'Le text avant ne peut pas dépasser 510 caractères'),

    textBack: z.string()
        .min(1, 'Le text avant doit au moins avoir 1 caractère')
        .max(510, 'Le text avant ne peut pas dépasser 510 caractères'),

    collectionID: z.string().uuid('ID de collection invalide'),

    URLFront: z.string().url().optional(),
    URLBack: z.string().url().optional(),
});

export const questionIdSchema = z.object({
    id: z.uuid(),
});

export const updateFlashCardSchema = z.object({
    textFront: z.string().min(1).max(510).optional(),
    textBack: z.string().min(1).max(510).optional(),
    URLFront: z.string().url().optional(),
    URLBack: z.string().url().optional(),
});

export const reviewFlashCardSchema = z.object({
    correct: z.boolean(),
});
