import express from 'express';
import {
  getCart,
  addToCart,
  clearCart,
} from '../controllers/cart-controller.js';
import { userAuth } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/', userAuth, getCart);
router.post('/', userAuth, addToCart);
router.delete('/', userAuth, clearCart);

export default router;
