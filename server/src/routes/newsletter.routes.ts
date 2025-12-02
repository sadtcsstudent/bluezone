import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { writeLimiter } from '../middleware/rateLimit.middleware';
import { subscribeNewsletterSchema } from '../utils/zod.schemas';
import { subscribeNewsletter, pastNewsletters } from '../controllers/newsletter.controller';

const router = Router();

router.post('/subscribe', writeLimiter, validate(subscribeNewsletterSchema), subscribeNewsletter);
router.get('/past', pastNewsletters);

export default router;
