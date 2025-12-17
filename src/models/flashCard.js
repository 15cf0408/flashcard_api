import { z } from 'zod';


export const createFlashCardSchema = z.object({
    textFront: z.string()
        .min(1, 'Le text avant doit au moins avoir 1 caractère')
        .max(510, 'Le text avant ne peut pas dépasser 510 caractères'),

    textBack: z.string()
        .min(1, 'Le text avant doit au moins avoir 1 caractère')
        .max(510, 'Le text avant ne peut pas dépasser 510 caractères'),
        
});

export const questionIdSchema = z.object({
    id: z.uuid(),
});
