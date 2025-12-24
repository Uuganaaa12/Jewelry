import express from 'express';
import {
  addReview,
  getProductReviews,
} from '../controllers/review-controller.js';
import { userAuth } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/', userAuth, addReview);
router.get('/:productId', getProductReviews);

export default router;
