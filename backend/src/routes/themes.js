import express from 'express';
import { 
  createTheme, 
  getThemes, 
  getThemeById, 
  updateTheme, 
  deleteTheme 
} from '../controllers/themeController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getThemes);
router.get('/:id', optionalAuth, getThemeById);

// Protected routes
router.post('/', authenticateToken, upload.single('thumbnail'), handleUploadError, createTheme);
router.put('/:id', authenticateToken, upload.single('thumbnail'), handleUploadError, updateTheme);
router.delete('/:id', authenticateToken, deleteTheme);

export default router;
