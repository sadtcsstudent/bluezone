import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware';
import { uploadAvatar, uploadEventImage, uploadGroupAvatar } from '../controllers/upload.controller';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image uploads allowed'));
    } else {
      cb(null, true);
    }
  }
});

router.post('/avatar', authenticate, upload.single('file'), uploadAvatar);
router.post('/event-image', authenticate, upload.single('file'), uploadEventImage);
router.post('/group-avatar', authenticate, upload.single('file'), uploadGroupAvatar);

export default router;
