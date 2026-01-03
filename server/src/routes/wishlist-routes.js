import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../controllers/wishlist-controller.js';
import { userAuth } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/', userAuth, getWishlist);
router.post('/', userAuth, addToWishlist);
router.delete('/:productId', userAuth, removeFromWishlist);
router.delete('/', userAuth, clearWishlist);

export default router;
