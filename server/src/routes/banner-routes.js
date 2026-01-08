import express from 'express';
import {
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
  getBannerById,
  uploadBannerImage,
} from '../controllers/banner-controller.js';
import { userAuth, adminAuth } from '../middlewares/auth-middleware.js';
import upload from '../middlewares/upload-middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllBanners);
router.get('/:id', getBannerById);

// Admin only routes
router.post('/', userAuth, adminAuth, createBanner);
router.put('/:id', userAuth, adminAuth, updateBanner);
router.delete('/:id', userAuth, adminAuth, deleteBanner);
router.post(
  '/upload',
  userAuth,
  adminAuth,
  upload.single('file'),
  uploadBannerImage
);

export default router;
