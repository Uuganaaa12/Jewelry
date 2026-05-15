import express from 'express';
import { verifyWebhook, handleWebhook } from '../controllers/messenger-controller.js';

const router = express.Router();

// Facebook webhook verification
router.get('/', verifyWebhook);

// Incoming messages from Facebook
router.post('/', handleWebhook);

export default router;
