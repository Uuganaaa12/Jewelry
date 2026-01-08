import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth-routes.js';
import adminRoutes from './routes/admin-routes.js';
import bannerRoutes from './routes/banner-routes.js';
import productRoutes from './routes/product-routes.js';
import categoryRoutes from './routes/category-routes.js';
import cartRoutes from './routes/cart-routes.js';
import orderRoutes from './routes/order-routes.js';
import paymentRoutes from './routes/payment-routes.js';
import reviewRoutes from './routes/review-routes.js';
import userRoutes from './routes/user-routes.js';
import wishlistRoutes from './routes/wishlist-routes.js';
import pushRoutes from './routes/push-routes.js';

const app = express();

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.ADMIN_ORIGIN,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/push', pushRoutes);

app.get('/', (req, res) => {
  res.send('API running...');
});

export default app;
