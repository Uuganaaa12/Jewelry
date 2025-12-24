import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
} from '../controllers/order-controller.js';
import { userAuth, adminAuth } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/', userAuth, createOrder);
router.get('/my', userAuth, getMyOrders);
router.get('/', userAuth, adminAuth, getAllOrders);

export default router;
