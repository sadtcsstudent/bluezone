import { Router } from 'express';
import { createPoll, deletePoll, getAdminPolls, getPolls, updatePoll, votePoll } from '../controllers/polls.controller';
import { authenticate, authorize, maybeAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', maybeAuthenticate, getPolls);
router.get('/manage', authenticate, authorize('admin', 'company'), getAdminPolls);
router.post('/', authenticate, authorize('admin', 'company'), createPoll);
router.put('/:id', authenticate, authorize('admin', 'company'), updatePoll);
router.delete('/:id', authenticate, authorize('admin', 'company'), deletePoll);
router.post('/vote', authenticate, votePoll);

export default router;
