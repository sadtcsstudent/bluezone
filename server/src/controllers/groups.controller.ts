import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

export const groupSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(2),
      category: z.string(),
      description: z.string(),
      avatar: z.string().optional()
    })
  }),
  update: z
    .object({
      name: z.string().min(2).optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      avatar: z.string().optional()
    })
    .strict()
};

const ensureGroupAdmin = async (groupId: string, userId: string) => {
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { groupId, userId } }
  });
  return membership?.role === 'admin' || membership?.role === 'moderator';
};

export const listGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query as Record<string, string>;
    const where = search
      ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      }
      : {};

    const groups = await prisma.group.findMany({ where, include: { members: true } });
    res.json({ groups });
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, description, avatar } = req.body;
    const group = await prisma.group.create({
      data: { name, category, description, avatar, members: { create: { userId: req.user!.id, role: 'admin' } } },
      include: { members: true }
    });
    res.status(201).json({ group });
  } catch (error) {
    next(error);
  }
};

export const getGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: { members: { include: { user: true } } }
    });
    if (!group) throw new AppError(404, 'Group not found');
    res.json({ group });
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = await ensureGroupAdmin(req.params.id, req.user!.id);
    if (!allowed && req.user!.role !== 'admin') throw new AppError(403, 'Not authorized');

    const updates = groupSchemas.update.parse(req.body);
    if (Object.keys(updates).length === 0) throw new AppError(400, 'No valid fields provided');

    const group = await prisma.group.update({ where: { id: req.params.id }, data: updates });
    res.json({ group });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = (error as any).errors.map((err: any) => err.message).join(', ') || 'Invalid group data';
      return next(new AppError(400, message));
    }
    next(error);
  }
};

export const deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = await ensureGroupAdmin(req.params.id, req.user!.id);
    if (!allowed && req.user!.role !== 'admin') throw new AppError(403, 'Not authorized');

    await prisma.group.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const joinGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groupExists = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (!groupExists) throw new AppError(404, 'Group not found');

    const membership = await prisma.groupMember.upsert({
      where: { userId_groupId: { userId: req.user!.id, groupId: req.params.id } },
      create: { userId: req.user!.id, groupId: req.params.id, role: 'member' },
      update: {}
    });
    res.json({ membership });
  } catch (error) {
    next(error);
  }
};

export const leaveGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.groupMember.delete({ where: { userId_groupId: { userId: req.user!.id, groupId: req.params.id } } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = await ensureGroupAdmin(req.params.id, req.user!.id);
    if (!allowed && req.user!.role !== 'admin') throw new AppError(403, 'Not authorized');

    const role = req.body.role as string | undefined;
    if (!role) throw new AppError(400, 'Role is required');

    const existing = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: req.params.userId, groupId: req.params.id } }
    });
    if (!existing) throw new AppError(404, 'Member not found');

    const isDemotingAdmin = ['admin', 'owner', 'moderator'].includes(existing.role) && role === 'member';
    if (isDemotingAdmin && req.user!.role !== 'admin') {
      const adminCount = await prisma.groupMember.count({
        where: { groupId: req.params.id, role: { in: ['admin', 'owner', 'moderator'] } }
      });
      if (adminCount <= 1) throw new AppError(400, 'Cannot remove the last group admin');
    }

    const updated = await prisma.groupMember.update({
      where: { userId_groupId: { userId: req.params.userId, groupId: req.params.id } },
      data: { role }
    });

    res.json({ membership: updated });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = await ensureGroupAdmin(req.params.id, req.user!.id);
    if (!allowed && req.user!.role !== 'admin') throw new AppError(403, 'Not authorized');

    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: req.params.userId, groupId: req.params.id } }
    });
    if (!member) throw new AppError(404, 'Member not found');

    const isRemovingAdmin = ['admin', 'owner', 'moderator'].includes(member.role);
    if (isRemovingAdmin && req.user!.role !== 'admin') {
      const adminCount = await prisma.groupMember.count({
        where: { groupId: req.params.id, role: { in: ['admin', 'owner', 'moderator'] } }
      });
      if (adminCount <= 1) throw new AppError(400, 'Cannot remove the last group admin');
    }

    await prisma.groupMember.delete({ where: { userId_groupId: { userId: req.params.userId, groupId: req.params.id } } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
