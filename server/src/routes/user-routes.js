import express from 'express';
import { userAuth } from '../middlewares/auth-middleware.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/user-controller.js';

const router = express.Router();

router.get('/me/wishlist', userAuth, getWishlist);
router.post('/me/wishlist', userAuth, addToWishlist);
router.delete('/me/wishlist/:productId', userAuth, removeFromWishlist);

export default router;
