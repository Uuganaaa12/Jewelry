import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        size: String,
      },
    ],
    phone: { type: String, required: true },
    address: { type: String, required: true },

    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: String,
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
