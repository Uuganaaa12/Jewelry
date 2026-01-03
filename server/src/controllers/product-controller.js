import cloudinary from '../config/cloudinary.js';
import Product from '../models/Product.js';
import cron from 'node-cron';
const coerceBoolean = value => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalised = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalised)) return true;
    if (['false', '0', 'no', 'off'].includes(normalised)) return false;
  }
  return undefined;
};

const coerceNumber = value => {
  if (value === undefined || value === null || value === '') return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const coerceDate = value => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseStringList = input => {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (error) {
      // Fall through to comma splitting.
    }
    return input
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const parseTags = input => parseStringList(input);

const parseImages = input => {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  return [input].filter(Boolean);
};

const parseOptionGroups = input => {
  if (!input) return [];

  const normalise = raw => {
    if (!raw?.key) return null;
    return {
      key: String(raw.key).trim(),
      label: raw.label || '',
      values: Array.isArray(raw.values) ? raw.values.filter(Boolean) : [],
      required: Boolean(raw.required),
    };
  };

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map(normalise).filter(Boolean);
    } catch (error) {
      // ignore invalid JSON
    }
    return [];
  }

  if (Array.isArray(input)) {
    return input.map(normalise).filter(Boolean);
  }

  return [];
};

const extractSaleFields = body => {
  const saleActive = coerceBoolean(body.saleActive);
  const salePrice =
    body.salePrice !== undefined
      ? coerceNumber(body.salePrice) ?? null
      : undefined;
  const saleStart = coerceDate(body.saleStart);
  const saleEnd = coerceDate(body.saleEnd);

  const payload = {};
  if (saleActive !== undefined) payload.saleActive = saleActive;
  if (salePrice !== undefined) payload.salePrice = salePrice;
  if (saleStart !== undefined) payload.saleStart = saleStart;
  if (saleEnd !== undefined) payload.saleEnd = saleEnd;
  return payload;
};

const buildProductPayload = body => {
  const payload = {};
  if (body.name !== undefined) payload.name = body.name;
  if (body.description !== undefined) payload.description = body.description;
  if (body.productType !== undefined) payload.productType = body.productType;

  if (body.price !== undefined) {
    const numericPrice = coerceNumber(body.price);
    if (numericPrice !== undefined) payload.price = numericPrice;
  }

  if (body.stock !== undefined) {
    const numericStock = coerceNumber(body.stock);
    if (numericStock !== undefined) payload.stock = numericStock;
  }

  if (body.category !== undefined) {
    payload.category = body.category || null;
  }

  if (body.tags !== undefined) {
    payload.tags = parseTags(body.tags);
  }

  if (body.colors !== undefined) {
    payload.colors = parseStringList(body.colors);
  }

  if (body.sku !== undefined) {
    if (body.sku === null) {
      payload.sku = '';
    } else if (typeof body.sku === 'string') {
      payload.sku = body.sku.trim();
    } else {
      payload.sku = body.sku;
    }
  }

  if (body.sizes !== undefined) {
    payload.sizes = parseStringList(body.sizes);
  }

  if (body.optionGroups !== undefined) {
    payload.optionGroups = parseOptionGroups(body.optionGroups);
  }

  if (body.images !== undefined) {
    payload.images = parseImages(body.images);
  }

  Object.assign(payload, extractSaleFields(body));
  return payload;
};

// Create product with JSON (image URLs)
export const createProduct = async (req, res) => {
  try {
    const payload = buildProductPayload(req.body);

    if (payload.price === undefined) {
      return res.status(400).json({ message: 'Price is required' });
    }

    if (!Array.isArray(payload.images)) {
      payload.images = [];
    }

    if (!Array.isArray(payload.tags)) {
      payload.tags = [];
    }

    const product = await Product.create(payload);

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create product with file upload
export const createProductWithUpload = async (req, res) => {
  try {
    const basePayload = buildProductPayload(req.body);
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'products',
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

    const payload = { ...basePayload, images };

    if (payload.price === undefined) {
      return res.status(400).json({ message: 'Price is required' });
    }

    if (!Array.isArray(payload.tags)) {
      payload.tags = [];
    }

    const product = await Product.create(payload);

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    const result = await Product.updateMany(
      { saleActive: true, saleEnd: { $lt: now } },
      { $set: { saleActive: false } }
    );
    if (result.modifiedCount > 0) {
      console.log(`${result.modifiedCount} expired sales deactivated`);
    }
  } catch (err) {
    console.error('Expire sales job error:', err);
  }
});

export const getProducts = async (req, res) => {
  try {
    const { category, onSale, search } = req.query || {};
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (onSale === 'true') {
      filter.saleActive = true;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const parsedLimit = Number(req.query?.limit);
    const hasValidLimit = Number.isFinite(parsedLimit) && parsedLimit > 0;
    const parsedPage = Number(req.query?.page);
    const hasPage = Number.isFinite(parsedPage) && parsedPage > 0;

    const baseQuery = Product.find(filter).populate('category', 'name');

    if (hasPage) {
      const pageSize = hasValidLimit ? parsedLimit : 12;
      const page = Math.max(1, Math.floor(parsedPage));
      const skip = (page - 1) * pageSize;

      const [items, total] = await Promise.all([
        Product.find(filter)
          .populate('category', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize),
        Product.countDocuments(filter),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return res.json({
        items,
        total,
        page,
        pageSize,
        totalPages,
      });
    }

    const query = hasValidLimit ? baseQuery.limit(parsedLimit) : baseQuery;
    const products = await query.sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name description'
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const payload = buildProductPayload(req.body);
    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
