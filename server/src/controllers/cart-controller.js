import Cart from '../models/Cart.js';

const populateCart = () => ({
  path: 'items.product',
  select:
    'name price images sku sizes saleActive salePrice saleStart saleEnd stock category',
  populate: {
    path: 'category',
    select: 'name description',
  },
});

const resolveQuantity = input => {
  const numeric = Number(input);
  if (!Number.isFinite(numeric) || numeric <= 0) return 1;
  return Math.floor(numeric);
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      populateCart()
    );
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { product: productId, quantity, size } = req.body || {};

    if (!productId) {
      return res.status(400).json({ message: 'Product id is required' });
    }

    const resolvedQty = resolveQuantity(quantity);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(item => {
      const sameProduct = item.product.toString() === productId;
      const sameSize = (item.size || null) === (size || null);
      return sameProduct && sameSize;
    });

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += resolvedQty;
    } else {
      cart.items.push({
        product: productId,
        quantity: resolvedQty,
        size: size || null,
      });
    }

    await cart.save();
    await cart.populate(populateCart());
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { product: productId, quantity, size } = req.body || {};

    if (!productId) {
      return res.status(400).json({ message: 'Product id is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Сагс хоосон байна.' });
    }

    const targetIndex = cart.items.findIndex(item => {
      const matchProduct = item.product.toString() === productId;
      const matchSize = (item.size || null) === (size || null);
      return matchProduct && matchSize;
    });

    if (targetIndex === -1) {
      return res.status(404).json({ message: 'Сагс хоосон байна.' });
    }

    const resolvedQty = resolveQuantity(quantity);
    cart.items[targetIndex].quantity = resolvedQty;

    await cart.save();
    await cart.populate(populateCart());
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size } = req.query || {};

    if (!productId) {
      return res.status(400).json({ message: 'Product id is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Сагс хоосон байна.' });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => {
      const sameProduct = item.product.toString() === productId;
      const sameSize = (item.size || null) === (size || null);
      return !(sameProduct && sameSize);
    });

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Сагс хоосон байна.' });
    }

    await cart.save();
    await cart.populate(populateCart());
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Сагс хоосолсон.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
