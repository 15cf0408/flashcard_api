import express from 'express';
import { getDashboardStats, getCollectionStats } from '../controllers/statsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// Get statistics for a specific collection
router.get('/collection/:id', getCollectionStats);

export default router;
