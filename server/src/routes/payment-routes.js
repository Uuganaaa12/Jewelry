import express from 'express';
import { createPayment } from '../controllers/payment-controller.js';
import { userAuth } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/', userAuth, createPayment);

export default router;
