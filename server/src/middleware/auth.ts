import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

export interface AuthedUser {
  id: number
  role: string
  username?: string
  email?: string
}

export interface AuthRequest extends Request {
  user?: AuthedUser
}

type TokenPayload = { id: number; role: string; iat?: number; exp?: number }

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get token from "Authorization: Bearer <token>"
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing token' })
    }

    const token = header.split(' ')[1]
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error('JWT_SECRET is not set')
      return res.status(500).json({ message: 'Server misconfigured' })
    }

    const payload = jwt.verify(token, secret) as TokenPayload

    // Ensure the user still exists (and get current role/username/email)
    const user = await User.findByPk(payload.id, {
      attributes: ['id', 'role', 'username', 'email'],
    })
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    // Attach a safe, plain object (not a Sequelize instance)
    req.user = {
      id: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    }

    return next()
  } catch (err) {
    console.error('authenticate failed:', err)
    return res.status(401).json({ message: 'Unauthorized' })
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' })
  }
  return next()
}