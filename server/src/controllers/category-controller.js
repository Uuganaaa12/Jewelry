import cloudinary from '../config/cloudinary.js';
import Category from '../models/Category.js';

const parseOptionTemplates = input => {
  if (!input) return [];
  const normalise = raw => {
    if (!raw?.key) return null;
    return {
      key: String(raw.key).trim(),
      label: raw.label || '',
      type: raw.type || 'choice',
      values: Array.isArray(raw.values) ? raw.values.filter(Boolean) : [],
      required: Boolean(raw.required),
    };
  };

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map(normalise).filter(Boolean);
    } catch (error) {
      // ignore invalid JSON and fall through
    }
    return [];
  }

  if (Array.isArray(input)) {
    return input.map(normalise).filter(Boolean);
  }

  return [];
};

const buildCategoryPayload = body => ({
  name: body.name,
  description: body.description,
  parent: body.parent || null,
  images: body.images || [],
  optionTemplates: parseOptionTemplates(body.optionTemplates),
});

// Create category with JSON (image URLs)
export const createCategory = async (req, res) => {
  try {
    const payload = buildCategoryPayload(req.body);
    const category = await Category.create(payload);

    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create category with file upload
export const createCategoryWithUpload = async (req, res) => {
  try {
    const { name, description, parent, optionTemplates } = req.body;
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
      optionTemplates: parseOptionTemplates(optionTemplates),
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
    const payload = buildCategoryPayload(req.body);
    const category = await Category.findByIdAndUpdate(req.params.id, payload, {
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
