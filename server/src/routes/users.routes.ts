import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateUserSchema } from '../utils/zod.schemas';
import {
  getProfile,
  updateProfile,
  getUserEvents,
  getUserGroups,
  getSavedInitiatives,
  changePassword,
  updateEmail,
  updatePreferences,
  deleteAccount
} from '../controllers/users.controller';
import { readLimiter, writeLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/me', readLimiter, authenticate, getProfile);
router.put('/me', writeLimiter, authenticate, validate(updateUserSchema), updateProfile);
router.get('/me/events', readLimiter, authenticate, getUserEvents);
router.get('/me/groups', readLimiter, authenticate, getUserGroups);
router.get('/me/saved-initiatives', readLimiter, authenticate, getSavedInitiatives);
router.put('/me/password', writeLimiter, authenticate, changePassword);
router.put('/me/email', writeLimiter, authenticate, updateEmail);
router.put('/me/preferences', writeLimiter, authenticate, validate(updateUserSchema), updatePreferences);
router.delete('/me', writeLimiter, authenticate, deleteAccount);

export default router;
