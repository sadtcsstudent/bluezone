import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

export const forumSchemas = {
  discussionBody: z.object({
    body: z.object({
      title: z.string().min(5).max(200),
      content: z.string().min(10).max(10000),
      category: z.string()
    })
  }),
  replyBody: z.object({ body: z.object({ content: z.string().min(1) }) })
};

export const listDiscussions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, sort = 'recent', limit = '10', offset = '0' } = req.query as Record<string, string>;
    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category) where.category = category;

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'popular') orderBy = { replies: { _count: 'desc' } };
    if (sort === 'active') orderBy = { updatedAt: 'desc' };

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({ where, take, skip, orderBy, include: { replies: true, author: true } }),
      prisma.discussion.count({ where })
    ]);

    res.json({ discussions, total });
  } catch (error) {
    next(error);
  }
};

export const createDiscussion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, category } = req.body;
    const discussion = await prisma.discussion.create({
      data: {
        title,
        content,
        category,
        authorId: req.user!.id
      }
    });
    res.status(201).json({ discussion });
  } catch (error) {
    next(error);
  }
};

export const getDiscussion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const discussion = await prisma.discussion.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
      include: {
        author: true,
        replies: { include: { author: true }, orderBy: { createdAt: 'asc' } }
      }
    });
    res.json({ discussion, replies: discussion.replies });
  } catch (error) {
    next(error);
  }
};

export const addReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    const reply = await prisma.reply.create({
      data: {
        content,
        authorId: req.user!.id,
        discussionId: req.params.id
      },
      include: { author: true }
    });
    res.status(201).json({ reply });
  } catch (error) {
    next(error);
  }
};

export const trendingDiscussions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const trending = await prisma.discussion.findMany({
      where: { createdAt: { gte: cutoff } },
      orderBy: [
        { replies: { _count: 'desc' } },
        { views: 'desc' }
      ],
      take: 5,
      include: { replies: true, author: true }
    });
    res.json({ discussions: trending });
  } catch (error) {
    next(error);
  }
};

export const updateDiscussion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const discussion = await prisma.discussion.findUnique({ where: { id: req.params.id } });
    if (!discussion) throw new AppError(404, 'Discussion not found');
    if (discussion.authorId !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'moderator') {
      throw new AppError(403, 'Not authorized');
    }

    const updated = await prisma.discussion.update({
      where: { id: req.params.id },
      data: { title: req.body.title, content: req.body.content, category: req.body.category }
    });
    res.json({ discussion: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteDiscussion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const discussion = await prisma.discussion.findUnique({ where: { id: req.params.id } });
    if (!discussion) throw new AppError(404, 'Discussion not found');
    if (discussion.authorId !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'moderator') {
      throw new AppError(403, 'Not authorized');
    }
    await prisma.discussion.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const updateReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reply = await prisma.reply.findUnique({ where: { id: req.params.replyId } });
    if (!reply) throw new AppError(404, 'Reply not found');
    if (reply.authorId !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'moderator') {
      throw new AppError(403, 'Not authorized');
    }
    const updated = await prisma.reply.update({ where: { id: req.params.replyId }, data: { content: req.body.content } });
    res.json({ reply: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reply = await prisma.reply.findUnique({ where: { id: req.params.replyId } });
    if (!reply) throw new AppError(404, 'Reply not found');
    if (reply.authorId !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'moderator') {
      throw new AppError(403, 'Not authorized');
    }
    await prisma.reply.delete({ where: { id: req.params.replyId } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
