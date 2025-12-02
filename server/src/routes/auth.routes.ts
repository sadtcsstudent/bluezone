import { Router } from 'express';
import passport from '../config/passport';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { loginLimiter, signupLimiter } from '../middleware/rateLimit.middleware';
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../utils/zod.schemas';
import {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  oauthCallback
} from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signupLimiter, validate(signupSchema), signup);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

export default router;
