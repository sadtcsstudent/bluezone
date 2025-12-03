import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { sendNewsletterConfirmation } from '../services/email.service';

export const newsletterSchemas = {
  subscribe: z.object({ body: z.object({ email: z.string().email() }) })
};

export const subscribeNewsletter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { subscribed: true },
      create: { email, subscribed: true, userId: req.user?.id }
    });
    await sendNewsletterConfirmation(email);
    res.json({ success: true, message: 'Subscribed to newsletter' });
  } catch (error) {
    next(error);
  }
};

export const unsubscribeNewsletter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { subscribed: false },
      create: { email, subscribed: false, userId: req.user?.id }
    });
    res.json({ success: true, message: 'Unsubscribed from newsletter' });
  } catch (error) {
    next(error);
  }
};

export const pastNewsletters = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const newsletters = await prisma.newsletter.findMany({ orderBy: { publishedAt: 'desc' } });
    res.json({ newsletters });
  } catch (error) {
    next(error);
  }
};
