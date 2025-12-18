import express from 'express';
import {
	createFlashCard,
	getFlashCardById,
	listFlashCardsByCollection,
	getDueFlashCards,
	updateFlashCard,
	deleteFlashCard,
	reviewFlashCard,
} from '../controllers/flashCardController.js';

import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createFlashCardSchema, updateFlashCardSchema, reviewFlashCardSchema } from '../models/flashCardModel.js';

const router = express.Router();
router.use(authenticate);

// Create a flashcard
router.post('/create', validateBody(createFlashCardSchema), createFlashCard);

// List flashcards for a collection
router.get('/collection/:collectionId', listFlashCardsByCollection);

// Get due flashcards for a collection (owner or admin)
router.get('/collection/:collectionId/due', getDueFlashCards);

// Get a flashcard by id
router.get('/:id', getFlashCardById);

// Update a flashcard
router.put('/update/:id', validateBody(updateFlashCardSchema), updateFlashCard);

// Delete a flashcard
router.delete('/delete/:id', deleteFlashCard);

// Review a flashcard (record result)
router.post('/:id/review', validateBody(reviewFlashCardSchema), reviewFlashCard);

export default router;