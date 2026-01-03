import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart-controller.js';
import { userAuth } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/', userAuth, getCart);
router.post('/', userAuth, addToCart);
router.put('/', userAuth, updateCartItem);
router.delete('/:productId', userAuth, removeFromCart);
router.delete('/', userAuth, clearCart);

export default router;
