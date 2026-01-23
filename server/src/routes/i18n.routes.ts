import { Router } from 'express';
import { getI18nOverrides } from '../controllers/i18n.controller';

const router = Router();

router.get('/overrides', getI18nOverrides);

export default router;
