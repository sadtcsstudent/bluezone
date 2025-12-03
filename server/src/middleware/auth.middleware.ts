import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../services/token.service';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { formatUser } from '../utils/serializers';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    const { userId } = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.suspended) {
      throw new AppError(401, 'Invalid or suspended user');
    }

    req.user = formatUser(user) as any;
    next();
  } catch (error) {
    next(new AppError(401, 'Invalid token'));
  }
}

// Soft-auth helper that attaches a user when a valid token is present but
// does not block unauthenticated requests.
export async function maybeAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();

  try {
    const { userId } = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user && !user.suspended) {
      req.user = formatUser(user) as any;
    }
  } catch (err) {
    // Ignore invalid/expired tokens for optional auth paths
  }

  next();
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions'));
      return;
    }
    next();
  };
}
