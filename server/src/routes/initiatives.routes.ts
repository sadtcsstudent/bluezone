import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { readLimiter, writeLimiter } from '../middleware/rateLimiter.middleware';
import { listInitiatives, saveInitiative, unsaveInitiative, initiativeSchemas } from '../controllers/initiatives.controller';

const router = Router();

router.get('/', readLimiter, validate(initiativeSchemas.list), listInitiatives);
router.post('/:id/save', writeLimiter, authenticate, saveInitiative);
router.delete('/:id/save', writeLimiter, authenticate, unsaveInitiative);

export default router;
