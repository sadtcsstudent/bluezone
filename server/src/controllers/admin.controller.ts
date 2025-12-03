import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { formatUsers } from '../utils/serializers';

export const listUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ users: formatUsers(users) });
  } catch (error) {
    next(error);
  }
};

export const suspendUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { suspended: req.body.suspended } });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const unlockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        lockoutUntil: null,
        failedLoginAttempts: 0
      }
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const adminCreateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.create({ data: req.body });
    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.update({ where: { id: req.params.id }, data: req.body });
    res.json({ event });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [users, events, discussions, groups] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.discussion.count(),
      prisma.group.count()
    ]);
    res.json({ stats: { users, events, discussions, groups } });
  } catch (error) {
    next(error);
  }
};
