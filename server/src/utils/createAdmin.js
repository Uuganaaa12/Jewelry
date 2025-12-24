import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  const hashed = await bcrypt.hash('admin123', 10);

  await User.create({
    name: 'Admin',
    email: 'admin@admin.com',
    password: hashed,
  });

  console.log('Admin created');
  process.exit();
};

createAdmin();
