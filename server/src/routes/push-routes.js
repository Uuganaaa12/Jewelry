import express from 'express';
import { adminAuth } from '../middlewares/auth-middleware.js';
import { subscribePush } from '../controllers/push-controller.js';

const router = express.Router();

router.post('/subscribe', adminAuth, subscribePush);

export default router;
