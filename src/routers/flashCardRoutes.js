import express, { Router } from 'express';
import { createQuestion} from '../controllers/flashCardController.js';

const router = Router();

router.use(authenticateToken);