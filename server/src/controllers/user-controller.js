import User from '../models/User.js';
import bcrypt from 'bcrypt';

const MAX_WISHLIST = 100;

const sanitizeProfile = user => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  address: user.address || {},
  profilePic: user.profilePic || '',
  preferences: user.preferences || { language: 'mn', newsletter: true },
  role: user.role,
});

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
  res.json(sanitizeProfile(user));
};

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });

  const allowed = ['name', 'phone', 'profilePic'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) {
      user[key] = req.body[key];
    }
  });

  if (req.body.address !== undefined && typeof req.body.address === 'object') {
    user.address = { ...user.address, ...req.body.address };
  }

  if (
    req.body.preferences !== undefined &&
    typeof req.body.preferences === 'object'
  ) {
    user.preferences = { ...user.preferences, ...req.body.preferences };
  }

  await user.save();
  res.json(sanitizeProfile(user));
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Одоогийн болон шинэ нууц үг шаардлагатай' });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
  if (!user.password) {
    return res
      .status(400)
      .json({ message: 'Google нэвтрэлттэй хэрэглэгч шууд сольж болохгүй' });
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    return res.status(401).json({ message: 'Одоогийн нууц үг буруу' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Нууц үг шинэчлэгдлээ' });
};

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
