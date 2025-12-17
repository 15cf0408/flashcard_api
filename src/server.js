import express from 'express';
import collectionRouter from './routers/collectionRouter.js';
import 'dotenv/config'
import { ADDRESS, PORT } from './config/env.js'
import authRouter from './routers/auth.js'

const app = express()

app.use(express.json())

// Routes
app.use('/collections', collectionRouter);
app.use('/auth', authRouter)

app.listen(PORT, () => {
  console.log(`Server is running on port https://${ADDRESS}:${PORT}`)
})
