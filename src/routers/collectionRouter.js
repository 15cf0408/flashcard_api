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
router.post('/collection', createCollection);
router.get('/collection/my', getMyCollections);
router.get('/collection/search', searchPublicCollections);
router.get('/collection/:id', getCollectionById);
router.put('/collection/:id', updateCollection);
router.delete('/collection/:id', deleteCollection);

export default router;
