import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

const formatSchema = z.enum(['plain', 'markdown']);

const updateSchema = z
  .object({
    overrides: z
      .array(
        z.object({
          key: z.string().min(1),
          locale: z.string().min(2),
          value: z.string().nullable()
        })
      )
      .optional()
      .default([]),
    formats: z
      .array(
        z.object({
          key: z.string().min(1),
          format: formatSchema
        })
      )
      .optional()
      .default([])
  })
  .strict();

const allowedLocales = new Set(['en', 'nl']);

export const getI18nOverrides = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locale = typeof req.query.locale === 'string' ? req.query.locale : 'en';
    if (!allowedLocales.has(locale)) {
      throw new AppError(400, 'Invalid locale');
    }

    const [overrides, formats] = await Promise.all([
      prisma.i18nOverride.findMany({
        where: { locale },
        select: { key: true, value: true }
      }),
      prisma.i18nKey.findMany({
        select: { key: true, format: true }
      })
    ]);

    const overrideMap: Record<string, string> = {};
    overrides.forEach((item) => {
      overrideMap[item.key] = item.value;
    });

    const formatMap: Record<string, string> = {};
    formats.forEach((item) => {
      formatMap[item.key] = item.format;
    });

    res.json({ overrides: overrideMap, formats: formatMap });
  } catch (error) {
    next(error);
  }
};

export const listI18nOverrides = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [overrides, formats] = await Promise.all([
      prisma.i18nOverride.findMany({
        select: { key: true, locale: true, value: true, updatedAt: true, updatedById: true },
        orderBy: [{ key: 'asc' }, { locale: 'asc' }]
      }),
      prisma.i18nKey.findMany({
        select: { key: true, format: true },
        orderBy: { key: 'asc' }
      })
    ]);

    res.json({ overrides, formats });
  } catch (error) {
    next(error);
  }
};

export const upsertI18nOverrides = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { overrides, formats } = updateSchema.parse(req.body);
    const formatMap = new Map(formats.map((item) => [item.key, item.format]));

    const operations = [
      ...formats.map((item) =>
        prisma.i18nKey.upsert({
          where: { key: item.key },
          update: { format: item.format },
          create: { key: item.key, format: item.format }
        })
      ),
      ...overrides.map((item) => {
        if (item.value === null) {
          return prisma.i18nOverride.deleteMany({
            where: { key: item.key, locale: item.locale }
          });
        }

        return prisma.i18nOverride.upsert({
          where: { key_locale: { key: item.key, locale: item.locale } },
          update: {
            value: item.value,
            updatedById: req.user?.id || null
          },
          create: {
            locale: item.locale,
            value: item.value,
            ...(req.user?.id ? { updatedBy: { connect: { id: req.user.id } } } : {}),
            keyMeta: {
              connectOrCreate: {
                where: { key: item.key },
                create: {
                  key: item.key,
                  format: formatMap.get(item.key) || 'plain'
                }
              }
            }
          }
        });
      })
    ];

    if (operations.length === 0) {
      res.json({ success: true });
      return;
    }

    await prisma.$transaction(operations);
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = (error as any).issues || (error as any).errors;
      const message = issues?.map((err: any) => err.message).join(', ') || 'Invalid i18n data';
      return next(new AppError(400, message));
    }
    next(error);
  }
};

export const deleteI18nOverride = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, locale } = req.params;
    if (!key || !locale) throw new AppError(400, 'Missing key or locale');

    await prisma.i18nOverride.deleteMany({
      where: { key, locale }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
