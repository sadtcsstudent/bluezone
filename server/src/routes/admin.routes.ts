import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { readLimiter, writeLimiter } from '../middleware/rateLimiter.middleware';
import {
  listUsers,
  suspendUser,
  unlockUser,
  deleteUser,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  getStats
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/users', readLimiter, listUsers);
router.put('/users/:id/suspend', writeLimiter, suspendUser);
router.put('/users/:id/unlock', writeLimiter, unlockUser);
router.delete('/users/:id', writeLimiter, deleteUser);
router.post('/events', writeLimiter, adminCreateEvent);
router.put('/events/:id', writeLimiter, adminUpdateEvent);
router.delete('/events/:id', writeLimiter, adminDeleteEvent);
router.get('/stats', readLimiter, getStats);

export default router;
