import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

export const categorySchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(1).max(50),
      icon: z.string().min(1),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
    })
  }),
  update: z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
      name: z.string().min(1).max(50).optional(),
      icon: z.string().min(1).optional(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
    })
  }),
  delete: z.object({
    params: z.object({ id: z.string() })
  }),
  reorder: z.object({
    body: z.object({
      categoryIds: z.array(z.string())
    })
  })
};

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { events: true } } }
    });

    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, icon, color } = req.body;

    const category = await prisma.category.create({
      data: { name, icon, color }
    });

    res.status(201).json({ category });
  } catch (error: any) {
    if (error.code === 'P2002') {
      next(new AppError('Category with this name already exists', 400));
    } else {
      next(error);
    }
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: updates
    });

    res.json({ category });
  } catch (error: any) {
    if (error.code === 'P2025') {
      next(new AppError('Category not found', 404));
    } else if (error.code === 'P2002') {
      next(new AppError('Category with this name already exists', 400));
    } else {
      next(error);
    }
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category has events
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { events: true } } }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category._count.events > 0) {
      throw new AppError('Cannot delete category with existing events', 400);
    }

    await prisma.category.delete({ where: { id } });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const reorderCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryIds } = req.body;

    // The order is now implicitly maintained by the frontend
    // We just verify all categories exist
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });

    if (categories.length !== categoryIds.length) {
      throw new AppError('Some categories not found', 400);
    }

    res.json({ message: 'Category order saved successfully' });
  } catch (error) {
    next(error);
  }
};
