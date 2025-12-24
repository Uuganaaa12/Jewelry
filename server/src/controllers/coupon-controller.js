import Coupon from '../models/Coupon.js';

export const applyCoupon = async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.body.code });

  if (!coupon || coupon.expireAt < new Date())
    return res.status(400).json({ message: 'Invalid coupon' });

  coupon.usedCount += 1;
  await coupon.save();

  res.json(coupon);
};
