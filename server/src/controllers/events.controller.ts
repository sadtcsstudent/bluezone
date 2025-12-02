import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { formatUser } from '../utils/serializers';

export const eventSchemas = {
  list: z.object({
    query: z.object({
      search: z.string().optional(),
      category: z.string().optional(),
      sort: z.string().optional(),
      limit: z.string().optional(),
      offset: z.string().optional()
    })
  }),
  register: z.object({
    body: z.object({ status: z.enum(['registered', 'interested']).optional() }),
    params: z.object({ id: z.string() })
  })
};

export const listEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, sort, limit = '10', offset = '0' } = req.query as Record<string, string>;
    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category) where.category = category;

    let orderBy: any = { date: 'asc' };
    if (sort === 'popularity') orderBy = { registrations: { _count: 'desc' } };
    if (sort === 'attendees') orderBy = { maxAttendees: 'desc' };

    const [events, total] = await Promise.all([
      prisma.event.findMany({ where, take, skip, orderBy, include: { registrations: true } }),
      prisma.event.count({ where })
    ]);

    res.set('Cache-Control', 'public, max-age=300');
    res.json({ events, total, page: Math.floor(skip / take) + 1, limit: take });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { registrations: { include: { user: true } } }
    });
    if (!event) throw new AppError(404, 'Event not found');

    const isRegistered = req.user ? event.registrations.some((r) => r.userId === req.user!.id) : false;
    const attendees = event.registrations.map((r) => formatUser(r.user));

    res.json({ event, isRegistered, attendees });
  } catch (error) {
    next(error);
  }
};

export const registerForEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const eventId = req.params.id;
    const status = (req.body.status as string) || 'registered';

    const registration = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: { registrations: true }
      });

      if (!event) throw new AppError(404, 'Event not found');

      const currentCount = event.registrations.length;
      if (event.maxAttendees && currentCount >= event.maxAttendees) {
        throw new AppError(400, 'Event is full');
      }

      const existing = event.registrations.find((r) => r.userId === userId);
      if (existing) return existing;

      return tx.eventRegistration.create({
        data: { userId, eventId, status }
      });
    });

    res.json({ success: true, registration });
  } catch (error) {
    next(error);
  }
};

export const unregisterForEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.eventRegistration.delete({
      where: { userId_eventId: { userId: req.user!.id, eventId: req.params.id } }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const listAttendees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: req.params.id },
      include: { user: true }
    });
    res.json({ attendees: registrations.map((r) => formatUser(r.user)) });
  } catch (error) {
    next(error);
  }
};
