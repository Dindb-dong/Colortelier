import express from 'express';
import { 
  createColorCode, 
  getColorCodes, 
  getColorCodeById, 
  updateColorCode, 
  deleteColorCode 
} from '../controllers/colorController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getColorCodes);
router.get('/:id', optionalAuth, getColorCodeById);

// Protected routes
router.post('/', authenticateToken, createColorCode);
router.put('/:id', authenticateToken, updateColorCode);
router.delete('/:id', authenticateToken, deleteColorCode);

export default router;
