import { Router } from 'express';
import { authenticate, maybeAuthenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createEventSchema, updateEventSchema } from '../utils/zod.schemas';
import {
  listEvents,
  getEvent,
  registerForEvent,
  unregisterForEvent,
  listAttendees,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/events.controller';
import { readLimiter, writeLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/', readLimiter, maybeAuthenticate, listEvents);
router.post('/', writeLimiter, authenticate, validate(createEventSchema), createEvent);
router.get('/:id', readLimiter, maybeAuthenticate, getEvent);
router.get('/:id/attendees', readLimiter, listAttendees);
router.post('/:id/register', writeLimiter, authenticate, registerForEvent);
router.delete('/:id/register', writeLimiter, authenticate, unregisterForEvent);
router.put('/:id', writeLimiter, authenticate, validate(updateEventSchema), updateEvent);
router.delete('/:id', writeLimiter, authenticate, deleteEvent);

export default router;
