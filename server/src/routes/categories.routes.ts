import { Router } from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
} from '../controllers/categories.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public route - anyone can list categories
router.get('/', listCategories);

// Admin-only routes
router.post('/', authenticate, authorize('admin'), createCategory);
router.put('/reorder', authenticate, authorize('admin'), reorderCategories);
router.put('/:id', authenticate, authorize('admin'), updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

export default router;
