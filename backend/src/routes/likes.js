import express from 'express';
import { 
  toggleColorLike, 
  toggleFilterLike, 
  getUserLikes, 
  checkLikeStatus 
} from '../controllers/likeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Toggle likes
router.post('/color-codes/:colorCodeId', toggleColorLike);
router.post('/filters/:filterId', toggleFilterLike);

// Get user's likes
router.get('/my-likes', getUserLikes);

// Check like status
router.get('/status', checkLikeStatus);

export default router;
