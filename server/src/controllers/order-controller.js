import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  console.log('reqq user', req.user.id);
  const order = await Order.create({
    user: req.user.id,
    items: req.body.items,
    totalAmount: req.body.totalAmount,
    paymentMethod: req.body.paymentMethod,
  });

  res.status(201).json(order);
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id });
  res.json(orders);
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user', 'email');
  res.json(orders);
};
