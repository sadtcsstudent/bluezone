import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

export const initiativeSchemas = {
  list: z.object({ query: z.object({ type: z.string().optional(), search: z.string().optional() }) }),
  create: z.object({
    body: z.object({
      title: z.string().min(2).optional(),
      name: z.string().min(2).optional(),
      description: z.string().min(5),
      category: z.string().optional(),
      type: z.string().optional(),
      location: z.string().optional(),
      coordinateX: z.number().optional(),
      coordinateY: z.number().optional(),
      contact: z.string().optional(),
      website: z.string().optional()
    })
  })
};

export const listInitiatives = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, search } = req.query as Record<string, string>;
    const where: any = {};
    if (type) where.type = type;
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];

    const [initiatives, saved] = await Promise.all([
      prisma.initiative.findMany({ where, orderBy: { createdAt: 'desc' } }),
      req.user?.id
        ? prisma.savedInitiative.findMany({ where: { userId: req.user.id }, select: { initiativeId: true } })
        : Promise.resolve([])
    ]);

    const savedIds = new Set(saved.map((s) => s.initiativeId));
    res.json({ initiatives: initiatives.map((i) => ({ ...i, isSaved: savedIds.has(i.id) })) });
  } catch (error) {
    next(error);
  }
};

export const saveInitiative = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const initiative = await prisma.initiative.findUnique({ where: { id: req.params.id } });
    if (!initiative) throw new AppError(404, 'Initiative not found');

    await prisma.savedInitiative.upsert({
      where: { userId_initiativeId: { userId: req.user!.id, initiativeId: req.params.id } },
      create: { userId: req.user!.id, initiativeId: req.params.id },
      update: {}
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const unsaveInitiative = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.savedInitiative.delete({ where: { userId_initiativeId: { userId: req.user!.id, initiativeId: req.params.id } } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const createInitiative = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      name,
      description,
      category,
      type,
      location,
      coordinateX,
      coordinateY,
      contact,
      website
    } = req.body;

    const initiative = await prisma.initiative.create({
      data: {
        name: name || title || 'Untitled Initiative',
        type: type || category || 'general',
        location: location || 'TBD',
        description: description || '',
        coordinateX: typeof coordinateX === 'number' ? coordinateX : 0,
        coordinateY: typeof coordinateY === 'number' ? coordinateY : 0,
        contact: contact || null,
        website: website || null,
        createdById: req.user?.id
      }
    });

    res.status(201).json({ initiative });
  } catch (error) {
    next(error);
  }
};

export const getInitiative = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const initiative = await prisma.initiative.findUnique({ where: { id: req.params.id } });
    if (!initiative) throw new AppError(404, 'Initiative not found');
    res.json({ initiative });
  } catch (error) {
    next(error);
  }
};

export const supportInitiative = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const initiative = await prisma.initiative.findUnique({ where: { id: req.params.id } });
    if (!initiative) throw new AppError(404, 'Initiative not found');

    await prisma.savedInitiative.upsert({
      where: { userId_initiativeId: { userId: req.user!.id, initiativeId: req.params.id } },
      create: { userId: req.user!.id, initiativeId: req.params.id },
      update: {}
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteInitiative = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'admin') {
      throw new AppError(403, 'Unauthorized');
    }

    await prisma.initiative.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const updateInitiative = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'admin') {
      throw new AppError(403, 'Unauthorized');
    }

    const {
      title,
      name,
      description,
      category,
      type,
      location,
      coordinateX,
      coordinateY,
      contact,
      website
    } = req.body;

    const initiative = await prisma.initiative.findUnique({ where: { id: req.params.id } });
    if (!initiative) throw new AppError(404, 'Initiative not found');

    const updated = await prisma.initiative.update({
      where: { id: req.params.id },
      data: {
        name: name || title || initiative.name,
        type: type || category || initiative.type,
        location: location || initiative.location,
        description: description || initiative.description,
        coordinateX: typeof coordinateX === 'number' ? coordinateX : initiative.coordinateX,
        coordinateY: typeof coordinateY === 'number' ? coordinateY : initiative.coordinateY,
        contact: contact !== undefined ? contact : initiative.contact,
        website: website !== undefined ? website : initiative.website
      }
    });

    res.json({ initiative: updated });
  } catch (error) {
    next(error);
  }
};
