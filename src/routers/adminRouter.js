import express from 'express';
import { listUsers, getUserById, deleteUser } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware pour vérifier que l'utilisateur est admin
const requireAdmin = (req, res, next) => {
    if (!req.auth?.is_admin) {
        return res.status(403).json({ error: 'Access denied: Admin privileges required' });
    }
    next();
};

// Toutes les routes nécessitent l'authentification ET le statut admin
router.use(authenticate);
router.use(requireAdmin);

// List all users
router.get('/users', listUsers);

// Get a specific user
router.get('/users/:id', getUserById);

// Delete a user
router.delete('/users/:id', deleteUser);

export default router;
