const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
   
  images: {
    type: [String],
    default: []
  },
   date: {
     type: String,
     required: true
}, 

}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);