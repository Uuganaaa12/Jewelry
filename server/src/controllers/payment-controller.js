import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

export const createPayment = async (req, res) => {
  const payment = await Payment.create(req.body);

  if (payment.status === 'success') {
    await Order.findByIdAndUpdate(payment.order, {
      isPaid: true,
      paidAt: new Date(),
      status: 'paid',
    });
  }

  res.json(payment);
};
