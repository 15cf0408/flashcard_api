import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { db } from '../db/db.js'
import { user } from '../db/schema.js'
import { JWT_SECRET, TOKEN_EXPIRATION } from '../config/env.js'

const sanitizeUser = (record) => {
  const { password, ...safeUser } = record
  return safeUser
}

const signToken = (account) =>
  jwt.sign(
    { sub: account.id, email: account.email, is_admin: account.is_admin },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  )

// POST /auth/register
export const register = async (req, res) => {
  const { email, password, first_name, last_name } = req.validatedBody || req.body

  try {
    const normalizedEmail = email.toLowerCase()
    const existing = await db.select().from(user).where(eq(user.email, normalizedEmail))
    if (existing.length) {
      return res.status(409).json({ message: 'Email already used.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [created] = await db
      .insert(user)
      .values({
        email: normalizedEmail,
        password: hashedPassword,
        first_name,
        last_name,
      })
      .returning()

    const token = signToken(created)
    return res.status(201).json({ user: sanitizeUser(created), token })
  } catch (error) {
    console.error('Erreur inscription:', error)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// POST /auth/login
export const login = async (req, res) => {
  const { email, password } = req.validatedBody || req.body

  try {
    const normalizedEmail = email.toLowerCase()
    const [existing] = await db.select().from(user).where(eq(user.email, normalizedEmail))
    if (!existing) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const passwordOk = await bcrypt.compare(password, existing.password)
    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const token = signToken(existing)
    return res.json({ user: sanitizeUser(existing), token })
  } catch (error) {
    console.error('Connection error :', error)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// GET /auth/me
export const currentUser = async (req, res) => {
  try {
    const [current] = await db.select().from(user).where(eq(user.id, req.auth.sub))
    if (!current) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.json({ user: sanitizeUser(current) })
  } catch (error) {
    console.error('Profile retrieval error :', error)
    return res.status(500).json({ message: 'Server error.' })
  }
}
