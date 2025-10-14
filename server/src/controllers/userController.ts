import { Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import User from '../models/User.js'

// helper: strip sensitive fields
function toSafe(u: any) {
  const plain = u?.get ? u.get({ plain: true }) : u
  if (plain) delete plain.password
  return plain
}

// GET /api/users/me
export async function me(req: AuthRequest, res: Response) {
  try {
    const id = Number((req.user as any)?.id)
    if (!id) return res.status(401).json({ message: 'Unauthorized' })

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    })
    if (!user) return res.status(404).json({ message: 'Not found' })

    return res.json(toSafe(user))
  } catch (err: any) {
    console.error('me failed:', err)
    return res.status(500).json({ message: 'Failed to fetch profile' })
  }
}

// GET /api/users
export async function listUsers(_req: AuthRequest, res: Response) {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    })
    return res.json(users.map(toSafe))
  } catch (err: any) {
    console.error('listUsers failed:', err)
    return res.status(500).json({ message: 'Failed to fetch users' })
  }
}

// GET /api/users/:id
export async function getUser(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' })

    const u = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    })
    if (!u) return res.status(404).json({ message: 'Not found' })

    const requesterId = Number((req.user as any)?.id)
    const requesterRole = (req.user as any)?.role
    const isAdmin = requesterRole === 'admin'
    const isSelf = requesterId === u.id

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    return res.json(toSafe(u))
  } catch (err: any) {
    console.error('getUser failed:', err)
    return res.status(500).json({ message: 'Failed to fetch user' })
  }
}

// PATCH /api/users/:id
export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' })

    const target = await User.findByPk(id)
    if (!target) return res.status(404).json({ message: 'Not found' })

    const requesterId = Number((req.user as any)?.id)
    const requesterRole = (req.user as any)?.role
    const isAdmin = requesterRole === 'admin'
    const isSelf = requesterId === target.id
    if (!isAdmin && !isSelf) return res.status(403).json({ message: 'Forbidden' })

    const { username, email, role } = req.body as {
      username?: string
      email?: string
      role?: string
    }

    const updates: any = {}
    if (username !== undefined) updates.username = username
    if (email !== undefined) updates.email = email
    if (role !== undefined && isAdmin) updates.role = role

    await target.update(updates)
    return res.json(toSafe(target))
  } catch (err: any) {
    console.error('updateUser failed:', err)
    return res.status(500).json({ message: 'Failed to update user' })
  }
}

// DELETE /api/users/:id
export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' })

    const target = await User.findByPk(id)
    if (!target) return res.status(404).json({ message: 'Not found' })

    const requesterId = Number((req.user as any)?.id)
    const requesterRole = (req.user as any)?.role
    const isAdmin = requesterRole === 'admin'
    const isSelf = requesterId === target.id
    if (!isAdmin && !isSelf) return res.status(403).json({ message: 'Forbidden' })

    await target.destroy()
    return res.json({ ok: true })
  } catch (err: any) {
    console.error('deleteUser failed:', err)
    return res.status(500).json({ message: 'Failed to delete user' })
  }
}

// PATCH /api/users/me
export async function updateMe(req: AuthRequest, res: Response) {
  try {
    const id = Number((req.user as any)?.id)
    if (!id) return res.status(401).json({ message: 'Unauthorized' })

    const user = await User.findByPk(id)
    if (!user) return res.status(404).json({ message: 'Not found' })

    const { username, email } = req.body as { username?: string; email?: string }
    const updates: any = {}
    if (username !== undefined) updates.username = username
    if (email !== undefined) updates.email = email

    await user.update(updates)
    return res.json(toSafe(user))
  } catch (err: any) {
    console.error('updateMe failed:', err)
    return res.status(500).json({ message: 'Failed to update profile' })
  }
}