import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
    },
    heading: {
      type: String,
    },
    description: {
      type: String,
    },
    primaryCta: {
      label: { type: String },
      href: { type: String },
    },
    secondaryCta: {
      label: { type: String },
      href: { type: String },
    },
    bgColor: {
      type: String,
      default: 'from-[#0d0d0d] to-[#4d5544]',
    },
    bgImage: {
      type: String,
      default: '',
    },
    textColor: {
      type: String,
      default: 'text-[#ffffff]',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Banner', bannerSchema);
