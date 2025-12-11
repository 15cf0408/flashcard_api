import 'dotenv/config'
import express from 'express'
import { ADDRESS, PORT } from './config/env.js'
import authRouter from './routers/auth.js'

const app = express()

app.use(express.json())

// Routes
app.use('/auth', authRouter)

app.listen(PORT, () => {
  console.log(`Server is running on port https://${ADDRESS}:${PORT}`)
})
