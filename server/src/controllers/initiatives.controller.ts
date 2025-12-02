import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

export const initiativeSchemas = {
  list: z.object({ query: z.object({ type: z.string().optional(), search: z.string().optional() }) })
};

export const listInitiatives = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, search } = req.query as Record<string, string>;
    const where: any = {};
    if (type) where.type = type;
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];

    const initiatives = await prisma.initiative.findMany({ where });
    res.json({ initiatives });
  } catch (error) {
    next(error);
  }
};

export const saveInitiative = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
