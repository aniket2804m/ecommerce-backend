const Review = require("../models/Review");
const cloudinary = require("../config/cloudinary");

exports.addReview = async (req, res) => {
  try {

    // 🔥 multer-cloudinary already uploaded images
    const imageUrls = req.files?.map(file => file.path) || [];

    const review = new Review({
      product: req.body.productId,
      userName: req.body.userName,
      rating: req.body.rating,
      comment: req.body.comment,
      images: imageUrls,
      date: req.body.date 
    });

    await review.save();

    res.json({ message: "Review added", review });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// 📥 GET REVIEWS BY PRODUCT
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId
    }).sort({ createdAt: -1 });

    res.json(reviews);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 ALL REVIEWS (Admin)
exports.getAllReviews = async (req, res) => {
  const reviews = await Review.find().populate("product");
  res.json(reviews);
};