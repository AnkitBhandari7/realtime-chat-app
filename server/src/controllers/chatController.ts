import { Request, Response } from 'express'
import { Op } from 'sequelize'
import Message from '../models/Message.js'
import User from '../models/User.js'

// type for requests with req.user (id/role set by auth middleware)
type AuthedRequest = Request & { user?: { id: number; role: string } }

// GET /api/chat/messages — latest public messages
export async function getMessages(req: Request, res: Response) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200)

    const msgs = await Message.findAll({
      where: { recipientId: null },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']],
      limit,
    })

    return res.json(msgs.reverse())
  } catch (err: any) {
    console.error('getMessages failed:', err)
    return res.status(500).json({ message: 'Failed to fetch messages' })
  }
}

// GET /api/chat/stats — counts for sidebar/header
export async function getStats(_req: Request, res: Response) {
  try {
    const [totalMessages, totalUsers] = await Promise.all([
      Message.count(),
      User.count(),
    ])

    const onlineUsers = (globalThis as any).__onlineUsersCount ?? 0
    return res.json({ totalMessages, totalUsers, onlineUsers })
  } catch (err: any) {
    console.error('getStats failed:', err)
    return res.status(500).json({ message: 'Failed to fetch stats' })
  }
}

// GET /api/chat/private/:userId — conversation between logged-in user and :userId
export async function getPrivateMessages(req: AuthedRequest, res: Response) {
  try {
    const currentUserId = req.user?.id
    const otherUserId = Number(req.params.userId)
    if (!currentUserId || Number.isNaN(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user id' })
    }

    const msgs = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: currentUserId },
        ],
      },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
      order: [['createdAt', 'ASC']],
    })

    return res.json(msgs)
  } catch (err: any) {
    console.error('getPrivateMessages failed:', err)
    return res.status(500).json({ message: 'Failed to fetch private messages' })
  }
}