const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  discount: Number,
  finalPrice: Number,
  infoText: String,

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  description: String,
  tag: String,

  colors: [
  {
    name: String,
    images: [String],

    specifications: [
      {
        label: String,
        value: String
      }
    ]
  }
],

  sizes: [
    {
      size: String,
      stock: Number,
    }
  ],


}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);