import express from 'express';
import {
    createCollection,
    getCollectionById,
    getMyCollections,
    searchPublicCollections,
    updateCollection,
    deleteCollection
} from '../controllers/collectionController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createCollectionSchema, updateCollectionSchema } from '../models/collectionModel.js';

const router = express.Router();

router.use(authenticate);
router.post('/', validateBody(createCollectionSchema), createCollection);
router.get('/my', getMyCollections);
router.get('/search', searchPublicCollections);
router.get('/:id', getCollectionById);
router.put('/:id', validateBody(updateCollectionSchema), updateCollection);
router.delete('/:id', deleteCollection);

export default router;
