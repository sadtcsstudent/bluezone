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

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, date, location, category, maxAttendees, image, imageUrl, time } = req.body;
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError(400, 'Invalid event date');
    }

    const normalizedTime = time || parsedDate.toISOString().split('T')[1]?.slice(0, 5) || '00:00';
    const parsedMax = maxAttendees !== undefined ? Number(maxAttendees) : undefined;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: parsedDate,
        time: normalizedTime,
        location,
        category,
        maxAttendees: typeof parsedMax === 'number' && !Number.isNaN(parsedMax) ? parsedMax : null,
        imageUrl: imageUrl || image || '',
        organizerId: req.user!.id
      }
    });

    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Event not found');
    if (existing.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      throw new AppError(403, 'Not authorized to update this event');
    }

    const { title, description, date, location, category, maxAttendees, image, imageUrl, time } = req.body;
    const data: any = {};

    if (title) data.title = title;
    if (description) data.description = description;
    if (location) data.location = location;
    if (category) data.category = category;
    if (typeof maxAttendees !== 'undefined') {
      const parsedMax = Number(maxAttendees);
      data.maxAttendees = Number.isNaN(parsedMax) ? null : parsedMax;
    }
    if (image || imageUrl) data.imageUrl = imageUrl || image;

    if (date) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) throw new AppError(400, 'Invalid event date');
      data.date = parsedDate;
      data.time = time || existing.time || parsedDate.toISOString().split('T')[1]?.slice(0, 5) || '00:00';
    } else if (time) {
      data.time = time;
    }

    const updated = await prisma.event.update({ where: { id: req.params.id }, data });
    res.json({ event: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Event not found');
    if (existing.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      throw new AppError(403, 'Not authorized to delete this event');
    }

    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
