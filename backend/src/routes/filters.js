import express from 'express';
import { 
  createFilter, 
  getFilters, 
  getFilterById, 
  updateFilter, 
  deleteFilter 
} from '../controllers/filterController.js';
import { authenticateToken, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getFilters);
router.get('/:id', optionalAuth, getFilterById);

// Admin-only routes
router.post('/', 
  requireAdmin, 
  upload.fields([
    { name: 'before_image', maxCount: 1 },
    { name: 'after_image', maxCount: 1 },
    { name: 'xmp_file', maxCount: 1 }
  ]), 
  handleUploadError, 
  createFilter
);
router.put('/:id', 
  requireAdmin, 
  upload.fields([
    { name: 'before_image', maxCount: 1 },
    { name: 'after_image', maxCount: 1 },
    { name: 'xmp_file', maxCount: 1 }
  ]), 
  handleUploadError, 
  updateFilter
);
router.delete('/:id', requireAdmin, deleteFilter);

export default router;
