import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

  const token = generateToken({
    id: user._id,
    role: user.role,
  });

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// User login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Google signup бол password байхгүй байж болно
    if (!user.password)
      return res.status(400).json({ message: 'Use Google login' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = generateToken({ id: user._id, role: user.role });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub: googleId, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        profilePic: picture,
        role: 'user',
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Google login failed' });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Already exist?
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: 'user',
    });

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const generateResetCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'И-мэйл шаардлагатай' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    }

    const code = generateResetCode();
    user.resetToken = code;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Жишээ/demo байдлаар кодыг шууд буцаана (реал кейст мэйлээр илгээнэ)
    res.json({ message: 'Сэргээх код илгээгдлээ', code });
  } catch (error) {
    console.error('Reset request error', error);
    res
      .status(500)
      .json({
        message: 'Сэргээх код илгээхэд алдаа гарлаа',
        error: error.message,
      });
  }
};

export const confirmPasswordReset = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body || {};
    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ message: 'И-мэйл, код, шинэ нууц үг шаардлагатай' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetToken || !user.resetTokenExpires) {
      return res.status(400).json({ message: 'Хүчингүй сэргээх хүсэлт' });
    }

    const now = Date.now();
    if (user.resetToken !== code || user.resetTokenExpires.getTime() < now) {
      return res
        .status(400)
        .json({ message: 'Код буруу эсвэл хугацаа дууссан' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Нууц үг шинэчлэгдлээ. Одоо нэвтэрнэ үү.' });
  } catch (error) {
    console.error('Reset confirm error', error);
    res
      .status(500)
      .json({
        message: 'Нууц үг шинэчлэхэд алдаа гарлаа',
        error: error.message,
      });
  }
};
