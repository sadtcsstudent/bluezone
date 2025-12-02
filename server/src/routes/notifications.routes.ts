import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { readLimiter, writeLimiter } from '../middleware/rateLimiter.middleware';
import {
  listNotifications,
  markNotificationRead,
  markAllRead,
  unreadNotifications
} from '../controllers/notifications.controller';

const router = Router();

router.get('/', readLimiter, authenticate, listNotifications);
router.put('/:id/read', writeLimiter, authenticate, markNotificationRead);
router.put('/read-all', writeLimiter, authenticate, markAllRead);
router.get('/unread-count', readLimiter, authenticate, unreadNotifications);

export default router;
