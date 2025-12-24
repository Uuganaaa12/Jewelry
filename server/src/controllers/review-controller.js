import Review from '../models/Review.js';

export const addReview = async (req, res) => {
  const review = await Review.create({
    ...req.body,
    user: req.user._id,
  });
  res.status(201).json(review);
};

export const getProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId });
  res.json(reviews);
};
