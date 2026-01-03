import express from 'express';
import {
  signup,
  loginUser,
  googleLogin,
  requestPasswordReset,
  confirmPasswordReset,
} from '../controllers/auth-controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/reset-request', requestPasswordReset);
router.post('/reset-confirm', confirmPasswordReset);

export default router;
