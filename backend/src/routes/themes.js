import express from 'express';
import { 
  createTheme, 
  getThemes, 
  getThemeById, 
  updateTheme, 
  deleteTheme 
} from '../controllers/themeController.js';
import { authenticateToken, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getThemes);
router.get('/:id', optionalAuth, getThemeById);

// Admin-only routes
router.post('/', requireAdmin, upload.single('thumbnail'), handleUploadError, createTheme);
router.put('/:id', requireAdmin, upload.single('thumbnail'), handleUploadError, updateTheme);
router.delete('/:id', requireAdmin, deleteTheme);

export default router;
