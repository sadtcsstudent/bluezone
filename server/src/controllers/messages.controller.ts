import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { formatUser } from '../utils/serializers';
import { getIO } from '../socket';

export const messageSchemas = {
  start: z.object({ body: z.object({ recipientId: z.string() }) }),
  send: z.object({ body: z.object({ content: z.string().min(1) }) })
};

export const listConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' }, include: { sender: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      conversations: conversations.map((c) => {
        const currentUserParticipant = c.participants.find(p => p.userId === userId);
        const unreadCount = currentUserParticipant ? currentUserParticipant.unreadCount : 0;
        const lastMessage = c.messages[0] ? { ...c.messages[0], sender: formatUser(c.messages[0].sender as any) } : null;

        return {
          ...c,
          unreadCount,
          lastMessage,
          participants: c.participants.map((p) => ({ ...p, user: formatUser(p.user as any) })),
          messages: c.messages.map((m) => ({ ...m, sender: formatUser(m.sender as any) }))
        };
      })
    });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const convo = await prisma.conversation.findFirst({
      where: {
        id: req.params.id,
        participants: { some: { userId: req.user!.id } }
      },
      include: {
        participants: { include: { user: true } },
        messages: { orderBy: { createdAt: 'asc' }, include: { sender: true } }
      }
    });
    if (!convo) throw new AppError(404, 'Conversation not found');
    res.json({
      conversation: {
        ...convo,
        participants: convo.participants.map((p) => ({ ...p, user: formatUser(p.user as any) })),
        messages: convo.messages.map((m) => ({ ...m, sender: formatUser(m.sender as any) }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const startConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user!.id;

    if (recipientId === userId) throw new AppError(400, 'Cannot message yourself');

    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: recipientId } } }
        ]
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId },
              { userId: recipientId }
            ]
          }
        }
      });
    }

    res.status(201).json({ conversation });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user!.id;
    const { content } = req.body;

    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId }
    });
    if (!participant) throw new AppError(403, 'Not part of conversation');

    const message = await prisma.message.create({
      data: { conversationId, senderId: userId, content },
      include: { sender: true }
    });

    await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId: { not: userId } },
      data: { unreadCount: { increment: 1 } }
    });

    // Emit socket event
    try {
      const io = getIO();
      const recipients = await prisma.conversationParticipant.findMany({
        where: { conversationId, userId: { not: userId } },
        select: { userId: true }
      });

      recipients.forEach(async (recipient) => {
        io.to(`user:${recipient.userId}`).emit('message:new', { ...message, sender: req.user });

        // Persist notification to database first
        try {
          const notification = await prisma.notification.create({
            data: {
              userId: recipient.userId,
              type: 'message',
              title: 'New Message',
              content: `New message from ${req.user?.name}`,
              link: `/messages/${conversationId}`
            }
          });

          // Emit the persisted notification object so it matches DB structure (including ID)
          io.to(`user:${recipient.userId}`).emit('notification:new', notification);
        } catch (err) {
          console.error('Failed to create notification record:', err);
        }
      });
    } catch (error) {
      // Socket error shouldn't fail the request
      console.error('Socket emission failed:', error);
    }

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

export const markConversationRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user!.id;

    await prisma.$transaction([
      prisma.message.updateMany({ where: { conversationId, senderId: { not: userId } }, data: { read: true } }),
      prisma.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId } },
        data: { unreadCount: 0, lastRead: new Date() }
      })
    ]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const unreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.conversationParticipant.aggregate({
      _sum: { unreadCount: true },
      where: { userId: req.user!.id }
    });
    res.json({ unread: count._sum.unreadCount || 0 });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user!.id;

    const membership = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId }
    });
    if (!membership) throw new AppError(403, 'Not part of conversation');

    const { remaining } = await prisma.$transaction(async (tx) => {
      await tx.conversationParticipant.delete({
        where: { conversationId_userId: { conversationId, userId } }
      });

      const remaining = await tx.conversationParticipant.count({ where: { conversationId } });
      if (remaining === 0) {
        await tx.message.deleteMany({ where: { conversationId } });
        await tx.conversation.delete({ where: { id: conversationId } });
      }

      return { remaining };
    });

    res.json({ success: true, conversationDeleted: remaining === 0 });
  } catch (error) {
    next(error);
  }
};
