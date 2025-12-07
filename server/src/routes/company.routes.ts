import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as controller from '../controllers/company.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('company'));

router.get('/stats', controller.getStats);

// Initiatives
router.get('/initiatives', controller.getMyInitiatives);
router.post('/initiatives', controller.createInitiative);
router.put('/initiatives/:id', controller.updateInitiative);
router.delete('/initiatives/:id', controller.deleteInitiative);

// Events (Companies reuse existing event structure, but managed via specific endpoints/logic if needed, 
// or we can reuse standard event endpoints if they check ownership. 
// But "getMyEvents" is specific.)
router.get('/events', controller.getMyEvents);
// Creating events is generally handled by general event controller, but we might want a specific one or ensure the general one allows companies. 
// Looking at Event controller, it uses `req.user.id` as organizer. So standard `POST /api/events` should work for companies too if authorized?
// Standard `POST /api/events` might be restricted to Admin. Let's check permissions later. 
// For now, let's assume usage of standard endpoints for creation, OR simple wrapper if needed.
// Actually, standard events controller often has `authorize('admin')`. If so, we need to allow 'company' there or here.
// Let's add basic event CRUD here just in case, reusing logic or forwarding. 
// But wait, the prompt says "company to have ability to create initiatives or events".
// I'll stick to read-only for now here and check Event Controller permissions.
// Update: Added `controller.getMyEvents` above. Creation usually goes to `events.controller`... 
// I will check `events.routes.ts` permissions.

export default router;
