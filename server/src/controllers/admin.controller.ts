import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { formatUsers } from '../utils/serializers';

const adminEventSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    date: z.string(),
    time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).optional(),
    location: z.string().min(2, 'Location is required'),
    category: z.string().min(2, 'Category is required'),
    maxAttendees: z
      .preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), z.number().int().positive())
      .optional(),
    imageUrl: z.string().optional(),
    image: z.string().optional(),
    organizerId: z.string().optional()
  })
  .strict();

const adminEventUpdateSchema = adminEventSchema.partial().strict();

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
    const body = adminEventSchema.parse(req.body);
    const parsedDate = new Date(body.date);
    if (Number.isNaN(parsedDate.getTime())) throw new AppError(400, 'Invalid event date');

    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        date: parsedDate,
        time: body.time || parsedDate.toISOString().split('T')[1]?.slice(0, 5) || '00:00',
        location: body.location,
        category: body.category,
        maxAttendees: typeof body.maxAttendees === 'number' ? body.maxAttendees : null,
        imageUrl: body.imageUrl || body.image || '',
        organizerId: body.organizerId || req.user!.id
      }
    });
    res.status(201).json({ event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((err) => err.message).join(', ') || 'Invalid event data';
      return next(new AppError(400, message));
    }
    next(error);
  }
};

export const adminUpdateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = adminEventUpdateSchema.parse(req.body);
    if (Object.keys(body).length === 0) throw new AppError(400, 'No fields to update');

    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Event not found');

    const data: any = {};
    if (body.title) data.title = body.title;
    if (body.description) data.description = body.description;
    if (body.location) data.location = body.location;
    if (body.category) data.category = body.category;
    if (typeof body.maxAttendees !== 'undefined') data.maxAttendees = body.maxAttendees ?? null;
    if (body.imageUrl || body.image) data.imageUrl = body.imageUrl || body.image;
    if (body.organizerId) data.organizerId = body.organizerId;

    if (body.date) {
      const parsedDate = new Date(body.date);
      if (Number.isNaN(parsedDate.getTime())) throw new AppError(400, 'Invalid event date');
      data.date = parsedDate;
      data.time = body.time || existing.time || parsedDate.toISOString().split('T')[1]?.slice(0, 5) || '00:00';
    } else if (body.time) {
      data.time = body.time;
    }

    const event = await prisma.event.update({ where: { id: req.params.id }, data });
    res.json({ event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((err) => err.message).join(', ') || 'Invalid event data';
      return next(new AppError(400, message));
    }
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
