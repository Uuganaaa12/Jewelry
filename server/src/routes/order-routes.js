import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderDetail,
  getOrdersFeed,
  updateOrderStatus,
} from '../controllers/order-controller.js';
import { userAuth, adminAuth } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/', userAuth, createOrder);
router.get('/my', userAuth, getMyOrders);
router.get('/feed', userAuth, adminAuth, getOrdersFeed);
router.get('/:id', userAuth, adminAuth, getOrderDetail);
router.get('/', userAuth, adminAuth, getAllOrders);
router.put('/:id/status', userAuth, adminAuth, updateOrderStatus);

export default router;
