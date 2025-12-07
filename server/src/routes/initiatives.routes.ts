import { Router } from 'express';
import { authenticate, maybeAuthenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { readLimiter, writeLimiter } from '../middleware/rateLimiter.middleware';
import {
  listInitiatives,
  saveInitiative,
  unsaveInitiative,
  initiativeSchemas,
  createInitiative,
  getInitiative,
  supportInitiative,
  deleteInitiative
} from '../controllers/initiatives.controller';

const router = Router();

router.get('/', readLimiter, maybeAuthenticate, validate(initiativeSchemas.list), listInitiatives);
router.post('/', writeLimiter, authenticate, validate(initiativeSchemas.create), createInitiative);
router.get('/:id', readLimiter, getInitiative);
router.post('/:id/support', writeLimiter, authenticate, supportInitiative);
router.post('/:id/save', writeLimiter, authenticate, saveInitiative);
router.delete('/:id/save', writeLimiter, authenticate, unsaveInitiative);
router.delete('/:id', writeLimiter, authenticate, deleteInitiative);

export default router;
