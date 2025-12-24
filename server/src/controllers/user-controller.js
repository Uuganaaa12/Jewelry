import User from '../models/User.js';

const MAX_WISHLIST = 100;

// 📄 GET
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user.id).populate(
    'wishlist',
    'name price images'
  );

  res.json(user.wishlist);
};

// ➕ POST
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user.id);

  if (user.wishlist.includes(productId)) {
    return res.status(400).json({ message: 'Already in wishlist' });
  }

  if (user.wishlist.length >= MAX_WISHLIST) {
    return res.status(400).json({ message: 'Wishlist limit reached (100)' });
  }

  user.wishlist.push(productId);
  await user.save();

  res.status(201).json(user.wishlist);
};

// ❌ DELETE
export const removeFromWishlist = async (req, res) => {
  const user = await User.findById(req.user.id);

  user.wishlist = user.wishlist.filter(
    id => id.toString() !== req.params.productId
  );

  await user.save();
  res.json(user.wishlist);
};
