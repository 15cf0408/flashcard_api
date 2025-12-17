import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env.js'

// Verifie le token Bearer et attache les infos decodees sur req.auth
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.auth = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' })
  }
}
