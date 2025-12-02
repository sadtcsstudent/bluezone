import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json({ notification });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.id }, data: { read: true } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const unreadNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.notification.count({ where: { userId: req.user!.id, read: false } });
    res.json({ unread: count });
  } catch (error) {
    next(error);
  }
};
