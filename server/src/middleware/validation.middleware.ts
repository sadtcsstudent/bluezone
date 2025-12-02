import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/errors';

export const validate = (schema: ZodSchema) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error as ZodError).issues || [];
        const message = issues.length ? issues.map((issue) => issue.message).join(', ') : 'Validation failed';
        next(new AppError(400, message));
      } else {
        next(new AppError(400, (error as Error)?.message || 'Validation failed'));
      }
    }
  };
