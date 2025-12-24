import express from 'express';
import {
  createProduct,
  createProductWithUpload,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product-controller.js';
import upload from '../middlewares/upload-middleware.js';
import { adminAuth } from '../middlewares/auth-middleware.js';

const router = express.Router();

// Create product with JSON (image URLs)
router.post('/',adminAuth, createProduct);

// Create product with file upload
router.post('/upload',adminAuth, upload.array('images', 5), createProductWithUpload);

// Other routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.put('/:id',adminAuth, updateProduct);
router.delete('/:id',adminAuth, deleteProduct);

export default router;
