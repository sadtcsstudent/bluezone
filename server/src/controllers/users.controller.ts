import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { hashPassword, verifyPassword } from '../services/auth.service';
import { isStrongPassword } from '../utils/validators';
import { formatUser, formatUsers } from '../utils/serializers';

export const userSchemas = {
  updateProfile: z.object({
    body: z.object({
      name: z.string().optional(),
      location: z.string().optional(),
      interests: z.array(z.string()).optional(),
      avatar: z.string().optional()
    })
  }),
  changePassword: z.object({
    body: z.object({ currentPassword: z.string(), newPassword: z.string() })
  }),
  updatePreferences: z.object({ body: z.object({ preferences: z.any() }) })
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRecord = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const [eventsAttended, groupsJoined, forumPosts] = await Promise.all([
      prisma.eventRegistration.count({ where: { userId: req.user!.id } }),
      prisma.groupMember.count({ where: { userId: req.user!.id } }),
      prisma.discussion.count({ where: { authorId: req.user!.id } })
    ]);

    res.json({ user: formatUser(userRecord), stats: { eventsAttended, groupsJoined, forumPosts } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, location, interests, avatar, bio } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name,
        location,
        interests: interests || undefined,
        avatar,
        bio
      }
    });
    res.json({ user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

export const getUserEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: req.user!.id },
      include: { event: true }
    });
    const now = new Date();
    const upcoming = registrations.filter((r) => r.event.date >= now).map((r) => r.event);
    const past = registrations.filter((r) => r.event.date < now).map((r) => r.event);
    res.json({ upcoming, past });
  } catch (error) {
    next(error);
  }
};

export const getUserGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await prisma.groupMember.findMany({ where: { userId: req.user!.id }, include: { group: true } });
    res.json({ groups: groups.map((g) => g.group) });
  } catch (error) {
    next(error);
  }
};

export const getSavedInitiatives = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const saved = await prisma.savedInitiative.findMany({ where: { userId: req.user!.id }, include: { initiative: true } });
    res.json({ initiatives: saved.map((s) => s.initiative) });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'User not found');

    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) throw new AppError(400, 'Invalid current password');

    if (!isStrongPassword(newPassword)) throw new AppError(400, 'Weak password');

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { preferences } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { preferences: preferences ?? undefined }
    });
    res.json({ user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

export const updateEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError(400, 'Email required');
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== req.user!.id) throw new AppError(400, 'Email already in use');
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: { email } });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.clearCookie('token');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string) || (req.query.search as string) || '';
    if (!query.trim()) {
      return res.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 20
    });

    res.json({ users: formatUsers(users) });
  } catch (error) {
    next(error);
  }
};
