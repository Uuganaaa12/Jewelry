import cloudinary from '../config/cloudinary.js';
import Category from '../models/Category.js';

// Create category with JSON (image URLs)
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent, images } = req.body;

    const category = await Category.create({
      name,
      description,
      parent: parent || null,
      images: images || [],
    });

    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create category with file upload
export const createCategoryWithUpload = async (req, res) => {
  try {
    const { name, description, parent } = req.body;
    let images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'categories',
              transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
              ],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        images.push(uploaded.secure_url);
      }
    }

    const category = await Category.create({
      name,
      description,
      parent: parent || null,
      images,
    });

    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parent', 'name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single category
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      'parent',
      'name'
    );

    if (!category)
      return res.status(404).json({ message: 'Category not found' });

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('parent', 'name');

    if (!category)
      return res.status(404).json({ message: 'Category not found' });

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category)
      return res.status(404).json({ message: 'Category not found' });

    res.json({ message: 'Category deleted successfully', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
