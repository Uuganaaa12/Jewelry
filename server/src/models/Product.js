import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    sku: { type: String, trim: true },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    saleActive: { type: Boolean, default: false },
    saleStart: { type: Date, default: null },
    saleEnd: { type: Date, default: null },
    images: [String],
    stock: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [String],
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    optionGroups: {
      type: [
        {
          key: { type: String, required: true, trim: true },
          label: { type: String, default: '' },
          values: { type: [String], default: [] },
          required: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    productType: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
