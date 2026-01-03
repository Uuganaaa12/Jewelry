import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    images: [String],
    optionTemplates: {
      type: [
        {
          key: { type: String, required: true, trim: true },
          label: { type: String, default: '' },
          type: {
            type: String,
            enum: ['size', 'color', 'choice', 'text'],
            default: 'choice',
          },
          values: { type: [String], default: [] },
          required: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
