import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { readLimiter, writeLimiter } from '../middleware/rateLimit.middleware';
import { sendMessageSchema, startConversationSchema } from '../utils/zod.schemas';
import {
  listConversations,
  getConversation,
  startConversation,
  sendMessage,
  deleteConversation,
  markConversationRead,
  unreadCount
} from '../controllers/messages.controller';

const router = Router();

router.get('/conversations', readLimiter, authenticate, listConversations);
router.get('/conversations/:id', readLimiter, authenticate, getConversation);
router.post('/conversations', writeLimiter, authenticate, validate(startConversationSchema), startConversation);
router.post('/conversations/:id/messages', writeLimiter, authenticate, validate(sendMessageSchema), sendMessage);
router.put('/conversations/:id/read', writeLimiter, authenticate, markConversationRead);
router.delete('/conversations/:id', writeLimiter, authenticate, deleteConversation);
router.get('/unread-count', readLimiter, authenticate, unreadCount);

export default router;
