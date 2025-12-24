import express from 'express';
import { adminAuth } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/dashboard', adminAuth, (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.id}` });
});

export default router;
