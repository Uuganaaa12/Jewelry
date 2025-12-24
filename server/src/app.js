import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth-routes.js';
import adminRoutes from './routes/admin-routes.js';
import productRoutes from './routes/product-routes.js';
import categoryRoutes from './routes/category-routes.js';
import cartRoutes from './routes/cart-routes.js';
import orderRoutes from './routes/order-routes.js';
import paymentRoutes from './routes/payment-routes.js';
import reviewRoutes from './routes/review-routes.js';
import userRoutes from './routes/user-routes.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API running...');
});

export default app;
