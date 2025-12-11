import express from 'express';
import {
    createCollection,
    getCollectionById,
    getMyCollections,
    searchPublicCollections,
    updateCollection,
    deleteCollection
} from '../controllers/collectionController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

router.use(authenticateToken);
router.post('/', createCollection);
router.get('/my', getMyCollections);
router.get('/search', searchPublicCollections);
router.get('/:id', getCollectionById);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

export default router;
