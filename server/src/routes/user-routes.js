import express from 'express';
import { userAuth } from '../middlewares/auth-middleware.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/user-controller.js';

const router = express.Router();

router.get('/me', userAuth, getProfile);
router.put('/me', userAuth, updateProfile);
router.put('/me/password', userAuth, changePassword);
router.get('/me/wishlist', userAuth, getWishlist);
router.post('/me/wishlist', userAuth, addToWishlist);
router.delete('/me/wishlist/:productId', userAuth, removeFromWishlist);

export default router;
