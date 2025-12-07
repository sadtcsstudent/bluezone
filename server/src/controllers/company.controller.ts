import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { z } from 'zod';

// Zod schemas for validation
const createInitiativeSchema = z.object({
    name: z.string().min(3),
    type: z.string(),
    location: z.string(),
    description: z.string(),
    coordinateX: z.number(),
    coordinateY: z.number(),
    contact: z.string().optional(),
    website: z.string().optional()
});

const createEventSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    date: z.string(),
    time: z.string(), // Assuming time is string "HH:mm" or similar, or derived from date
    location: z.string(),
    category: z.string(),
    imageUrl: z.string().optional(),
    maxAttendees: z.number().optional()
});

/**
 * Get company statistics
 */
export async function getStats(req: Request, res: Response) {
    const userId = req.user!.id;

    const [initiativesCount, eventsCount] = await Promise.all([
        prisma.initiative.count({ where: { createdById: userId } }),
        prisma.event.count({ where: { organizerId: userId } })
    ]);

    res.json({
        stats: {
            initiatives: initiativesCount,
            events: eventsCount
        }
    });
}

/**
 * Get initiatives created by the company
 */
export async function getMyInitiatives(req: Request, res: Response) {
    const userId = req.user!.id;
    const initiatives = await prisma.initiative.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ initiatives });
}

/**
 * Create a new initiative for the company
 */
export async function createInitiative(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = createInitiativeSchema.parse(req.body);

    const initiative = await prisma.initiative.create({
        data: {
            ...data,
            createdById: userId
        }
    });

    res.status(201).json({ initiative });
}

/**
 * Update a company initiative
 */
export async function updateInitiative(req: Request, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = createInitiativeSchema.partial().parse(req.body);

    const initiative = await prisma.initiative.findUnique({ where: { id } });

    if (!initiative) throw new AppError(404, 'Initiative not found');
    if (initiative.createdById !== userId) throw new AppError(403, 'Not authorized');

    const updated = await prisma.initiative.update({
        where: { id },
        data
    });

    res.json({ initiative: updated });
}

/**
 * Delete a company initiative
 */
export async function deleteInitiative(req: Request, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    const initiative = await prisma.initiative.findUnique({ where: { id } });

    if (!initiative) throw new AppError(404, 'Initiative not found');
    if (initiative.createdById !== userId) throw new AppError(403, 'Not authorized');

    await prisma.initiative.delete({ where: { id } });

    res.status(204).send();
}

/**
 * Get events created by the company
 */
export async function getMyEvents(req: Request, res: Response) {
    const userId = req.user!.id;
    const events = await prisma.event.findMany({
        where: { organizerId: userId },
        orderBy: { date: 'asc' }
    });
    res.json({ events });
}
