import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { generateToken } from '../services/token.service';
import { hashPassword, verifyPassword } from '../services/auth.service';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service';
import { isStrongPassword } from '../utils/validators';
import { formatUser } from '../utils/serializers';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const authSchemas = {
  signup: z.object({
    body: z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: passwordSchema,
      location: z.string().optional(),
      interests: z.array(z.string()).optional(),
      newsletter: z.boolean().optional()
    })
  }),
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
      rememberMe: z.boolean().optional()
    })
  }),
  forgot: z.object({
    body: z.object({ email: z.string().email() })
  }),
  reset: z.object({
    body: z.object({ token: z.string(), newPassword: passwordSchema })
  })
};

const setAuthCookie = (res: Response, token: string, rememberMe?: boolean) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: (rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000
  });
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, location, interests, newsletter } = req.body;

    if (!isStrongPassword(password)) {
      throw new AppError(400, 'Password must include at least 8 chars, one uppercase letter, and one number');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(400, 'Email already registered');

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        location,
        interests: interests || [],
        newsletter: !!newsletter
      }
    });

    if (newsletter) {
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: { subscribed: true, userId: user.id },
        create: { email, subscribed: true, userId: user.id }
      });
    }

    const token = generateToken(user.id);
    setAuthCookie(res, token);
    await sendWelcomeEmail(user.email, user.name);

    res.json({ token, user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Use generic error to prevent enumeration, but for lockout we need to know if user exists? 
      // Actually, if user doesn't exist, we can't lock them out.
      // Just delay response to prevent timing attacks?
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new AppError(401, 'Invalid credentials');
    }

    if (user.suspended) throw new AppError(403, 'Account suspended');

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new AppError(429, 'Account locked. Please try again later.');
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      let lockoutUntil = user.lockoutUntil;

      if (attempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts, lockoutUntil }
      });

      throw new AppError(401, 'Invalid credentials');
    }

    // Reset lockout on success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        lockoutUntil: null
      }
    });

    const token = generateToken(user.id, rememberMe);
    setAuthCookie(res, token, rememberMe);

    res.json({ token, user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true });
};

export const getMe = async (req: Request, res: Response) => {
  res.json({ user: formatUser(req.user!) });
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.json({ success: true });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token,
        expires,
        userId: user.id
      }
    });

    await sendPasswordResetEmail(email, token);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const verifyResetToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token;
    const reset = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expires < new Date()) throw new AppError(400, 'Invalid token');
    res.json({ valid: true });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    const reset = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expires < new Date()) throw new AppError(400, 'Invalid or expired token');

    if (!isStrongPassword(newPassword)) {
      throw new AppError(400, 'Password must include at least 8 chars, one uppercase letter, and one number');
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } });
    await prisma.passwordResetToken.update({ where: { token }, data: { used: true } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const oauthCallback = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    res.redirect('/login');
    return;
  }
  const token = generateToken(user.id);
  setAuthCookie(res, token, true);
  res.redirect('/');
};
