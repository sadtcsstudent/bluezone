import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { readLimiter, writeLimiter } from '../middleware/rateLimit.middleware';
import { createGroupSchema, updateGroupSchema } from '../utils/zod.schemas';
import {
  listGroups,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  updateMemberRole
} from '../controllers/groups.controller';

const router = Router();

router.get('/', readLimiter, listGroups);
router.get('/:id', readLimiter, getGroup);
router.post('/', writeLimiter, authenticate, validate(createGroupSchema), createGroup);
router.put('/:id', writeLimiter, authenticate, validate(updateGroupSchema), updateGroup);
router.delete('/:id', writeLimiter, authenticate, deleteGroup);
router.post('/:id/join', writeLimiter, authenticate, joinGroup);
router.delete('/:id/leave', writeLimiter, authenticate, leaveGroup);
router.put('/:id/members/:userId/role', writeLimiter, authenticate, updateMemberRole);

export default router;
