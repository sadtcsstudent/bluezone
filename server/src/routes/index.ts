import { Router } from 'express';
import authRoutes from './auth.routes';
import eventsRoutes from './events.routes';
import forumRoutes from './forum.routes';
import usersRoutes from './users.routes';
import initiativesRoutes from './initiatives.routes';
import newsletterRoutes from './newsletter.routes';
import groupsRoutes from './groups.routes';
import messagesRoutes from './messages.routes';
import notificationsRoutes from './notifications.routes';
import adminRoutes from './admin.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventsRoutes);
router.use('/forum', forumRoutes);
router.use('/users', usersRoutes);
router.use('/initiatives', initiativesRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/groups', groupsRoutes);
router.use('/messages', messagesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

export default router;
