import Cart from '../models/Cart.js';

export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product'
  );
  res.json(cart || { items: [] });
};

export const addToCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const itemIndex = cart.items.findIndex(
    i => i.product.toString() === req.body.product
  );

  if (itemIndex > -1) cart.items[itemIndex].quantity += 1;
  else cart.items.push({ product: req.body.product });

  await cart.save();
  res.json(cart);
};

export const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ message: 'Cart cleared' });
};
