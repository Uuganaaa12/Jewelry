import Order from '../models/Order.js';

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

const ADMIN_MUTABLE_STATUSES = ['shipped', 'delivered', 'cancelled'];

export const createOrder = async (req, res) => {
  console.log('reqq user', req.user.id);
  const order = await Order.create({
    user: req.user.id,
    items: req.body.items,
    phone: req.body.phone,
    address: req.body.address,
    totalAmount: req.body.totalAmount,
    paymentMethod: req.body.paymentMethod,
  });

  res.status(201).json(order);
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate(
      'items.product',
      'name price images sku sizes saleActive salePrice saleStart saleEnd'
    );

  const mapped = orders.map(order => ({
    id: order._id,
    status: order.status,
    paymentMethod: order.paymentMethod || 'unknown',
    totalAmount: Number(order.totalAmount) || 0,
    isPaid: Boolean(order.isPaid),
    paidAt: order.paidAt || null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: (order.items || []).map(item => {
      const productDoc = item.product && item.product._id ? item.product : null;
      const image =
        Array.isArray(productDoc?.images) && productDoc.images.length > 0
          ? productDoc.images[0]
          : null;
      const basePrice = Number.isFinite(item.price)
        ? Number(item.price)
        : Number(productDoc?.price) || 0;
      const salePrice = Number(productDoc?.salePrice);
      const saleActive = Boolean(productDoc?.saleActive);

      return {
        productId: productDoc?._id || item.product,
        name: item.name || productDoc?.name || 'Бүтээгдэхүүн',
        sku: productDoc?.sku || '—',
        quantity: Number(item.quantity) || 0,
        size: item.size || null,
        unitPrice: basePrice,
        saleActive,
        salePrice: Number.isFinite(salePrice) ? salePrice : null,
        image,
      };
    }),
  }));

  res.json(mapped);
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user', 'email');
  res.json(orders);
};

export const getOrderDetail = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Order id is required' });
  }

  try {
    const order = await Order.findById(id)
      .populate('user', 'name email phoneNumber')
      .populate({
        path: 'items.product',
        select:
          'name price images sku stock sizes saleActive salePrice saleStart saleEnd',
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const userDetail = order.user
      ? {
          id: order.user._id,
          name: order.user.name || 'Customer',
          email: order.user.email || 'N/A',
          phone: order.user.phoneNumber || null,
        }
      : null;

    const items = (order.items || []).map(item => {
      const productDoc = item.product && item.product._id ? item.product : null;
      const basePrice = Number.isFinite(item.price)
        ? Number(item.price)
        : Number(productDoc?.price) || 0;
      const salePrice = Number(productDoc?.salePrice);
      const saleActive = Boolean(productDoc?.saleActive);
      const image =
        Array.isArray(productDoc?.images) && productDoc.images.length > 0
          ? productDoc.images[0]
          : null;

      return {
        productId: productDoc?._id || item.product,
        name: item.name || productDoc?.name || 'Product',
        sku: productDoc?.sku || '—',
        quantity: Number(item.quantity) || 0,
        unitPrice: basePrice,
        subtotal: basePrice * (Number(item.quantity) || 0),
        saleActive,
        salePrice: Number.isFinite(salePrice) ? salePrice : null,
        image,
        size: item.size || null,
        availableSizes: Array.isArray(productDoc?.sizes)
          ? productDoc.sizes.filter(Boolean)
          : [],
      };
    });

    res.json({
      id: order._id,
      status: order.status,
      totalAmount: Number(order.totalAmount) || 0,
      paymentMethod: order.paymentMethod || 'unknown',
      isPaid: Boolean(order.isPaid),
      paidAt: order.paidAt || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: userDetail,
      items,
    });
  } catch (error) {
    console.error('Failed to load order detail', error);
    res
      .status(500)
      .json({ message: 'Failed to load order detail', error: error.message });
  }
};

export const getOrdersFeed = async (req, res) => {
  const pageParam = parseInt(req.query.page, 10);
  const limitParam = parseInt(req.query.limit, 10);

  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const clampedLimit =
    Number.isNaN(limitParam) || limitParam < 1 ? 10 : limitParam;
  const limit = clampedLimit > 100 ? 100 : clampedLimit;

  const filter = { status: { $ne: 'pending' } };

  try {
    const [total, aggregates] = await Promise.all([
      Order.countDocuments(filter),
      Order.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$totalAmount' },
            openCount: {
              $sum: {
                $cond: [{ $in: ['$status', ['delivered', 'cancelled']] }, 0, 1],
              },
            },
          },
        },
      ]),
    ]);

    const summaryDoc = aggregates[0] || { totalValue: 0, openCount: 0 };
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
    const normalizedPage = Math.min(Math.max(page, 1), totalPages);
    const normalizedSkip = (normalizedPage - 1) * limit;

    const orders = await Order.find(filter)
      .populate('user', 'email name')
      .sort({ createdAt: -1 })
      .skip(normalizedSkip)
      .limit(limit);

    const items = orders.map(order => ({
      id: order._id,
      total: Number(order.totalAmount) || 0,
      payment: order.paymentMethod || 'unknown',
      user:
        order?.user?.email || order?.user?.name || order?.user || 'Customer',
      createdAt: order.createdAt || null,
      status: order.status || 'pending',
    }));

    res.json({
      items,
      pagination: {
        page: normalizedPage,
        limit,
        total,
        pages: Math.max(totalPages, 1),
      },
      summary: {
        totalValue: Number(summaryDoc.totalValue) || 0,
        openCount: Number(summaryDoc.openCount) || 0,
      },
    });
  } catch (error) {
    console.error('Failed to load orders feed', error);
    res
      .status(500)
      .json({ message: 'Failed to load orders feed', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status || !ADMIN_MUTABLE_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ message: 'Invalid status supplied for order update' });
  }

  const order = await Order.findById(id).populate('user', 'email');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status === 'pending') {
    return res
      .status(400)
      .json({ message: 'Order not paid yet; status cannot be updated' });
  }

  if (['delivered', 'cancelled'].includes(order.status)) {
    return res.status(400).json({ message: 'Order already finalised' });
  }

  order.status = status;
  await order.save();

  res.json(order);
};
