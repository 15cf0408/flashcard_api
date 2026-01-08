import express from 'express';
import cors from 'cors';
import collectionRouter from './routers/collectionRouter.js';
import flashCardRouter from './routers/flashCardRoutes.js';
import adminRouter from './routers/adminRouter.js';
import statsRouter from './routers/statsRouter.js';
import 'dotenv/config'
import { ADDRESS, PORT } from './config/env.js'
import authRouter from './routers/auth.js'

const app = express()

// CORS configuration for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: true
}))

app.use(express.json())

// Routes
app.use('/auth', authRouter)
app.use('/collections', collectionRouter);
app.use('/flashcards', flashCardRouter);
app.use('/admin', adminRouter);
app.use('/stats', statsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port https://${ADDRESS}:${PORT}`)
})
