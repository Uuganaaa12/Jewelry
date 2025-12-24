import express from 'express';
import multer from 'multer';
import {
  createCategory,
  createCategoryWithUpload,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category-controller.js';
import { adminAuth } from '../middlewares/auth-middleware.js';
const router = express.Router();

// Multer memory storage тохиргоо
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Зөвхөн зураг файл оруулна уу!'), false);
    }
  },
});

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (хэрэв хэрэгтэй бол)
// Зураг upload-тай category үүсгэх
router.post('/upload',adminAuth,  upload.array('images', 5), createCategoryWithUpload);

// JSON-тай category үүсгэх
router.post('/', adminAuth, createCategory);

// Update ба Delete
router.put('/:id', adminAuth, updateCategory);
router.delete('/:id',adminAuth, deleteCategory);

export default router;
