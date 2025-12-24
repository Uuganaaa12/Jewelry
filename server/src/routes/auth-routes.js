import express from 'express';
import {
  signup,
  loginUser,
  googleLogin,
} from '../controllers/auth-controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', loginUser);
router.post('/google', googleLogin);

export default router;
