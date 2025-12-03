import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { readLimiter, writeLimiter } from '../middleware/rateLimit.middleware';
import { createDiscussionSchema, createReplySchema } from '../utils/zod.schemas';
import {
  listDiscussions,
  createDiscussion,
  getDiscussion,
  addReply,
  trendingDiscussions,
  updateDiscussion,
  deleteDiscussion,
  updateReply,
  deleteReply,
  likeDiscussion
} from '../controllers/forum.controller';

const router = Router();

router.get('/discussions', readLimiter, listDiscussions);
router.get('/discussions/trending', readLimiter, trendingDiscussions);
router.post('/discussions', writeLimiter, authenticate, validate(createDiscussionSchema), createDiscussion);
router.get('/discussions/:id', readLimiter, getDiscussion);
router.post('/discussions/:id/replies', writeLimiter, authenticate, validate(createReplySchema), addReply);
router.put('/discussions/:id', writeLimiter, authenticate, updateDiscussion);
router.delete('/discussions/:id', writeLimiter, authenticate, deleteDiscussion);
router.put('/discussions/:id/replies/:replyId', writeLimiter, authenticate, updateReply);
router.delete('/discussions/:id/replies/:replyId', writeLimiter, authenticate, deleteReply);
router.put('/replies/:replyId', writeLimiter, authenticate, updateReply);
router.delete('/replies/:replyId', writeLimiter, authenticate, deleteReply);
router.post('/discussions/:id/like', writeLimiter, authenticate, likeDiscussion);

export default router;
