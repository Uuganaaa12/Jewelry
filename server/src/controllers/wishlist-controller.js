import Product from '../models/Product.js';
import User from '../models/User.js';

const populateWishlist = () => ({
  path: 'wishlist',
  select:
    'name price images sku sizes saleActive salePrice saleStart saleEnd stock category',
  populate: {
    path: 'category',
    select: 'name description',
  },
});

const ensureProductExists = async productId => {
  const product = await Product.findById(productId).select('_id');
  return Boolean(product);
};

export const getWishlist = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).populate(populateWishlist());
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { product: productId } = req.body || {};
    if (!productId) {
      return res.status(400).json({ message: 'Product id is required' });
    }

    const productExists = await ensureProductExists(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate(populateWishlist());

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(201).json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: 'Product id is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate(populateWishlist());

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { wishlist: [] } },
      { new: true }
    ).populate(populateWishlist());

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
