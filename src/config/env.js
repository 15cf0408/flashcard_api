import 'dotenv/config'

const requiredEnv = ['DB_FILE_NAME', 'JWT_SECRET']

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} doit etre defini dans le fichier .env`)
  }
})

export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
export const ADDRESS = process.env.ADDRESS || 'localhost'
export const JWT_SECRET = process.env.JWT_SECRET
export const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || '7d'
