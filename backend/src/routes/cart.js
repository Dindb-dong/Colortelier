import express from 'express';
import { 
  addToCart, 
  getCartItems, 
  removeFromCart, 
  clearCart, 
  getCartCount 
} from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Cart operations
router.post('/add', addToCart);
router.get('/', getCartItems);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);
router.get('/count', getCartCount);

export default router;
