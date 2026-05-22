const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number,
      size: String
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  billingDetails: {
    name: { type: String, required: true },
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },

  paymentMethod: {
    type: String,
    enum: ["cod", "razorpay"],
    default: "cod"
  },

   status: {
    type: String,
    enum: ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"],
    default: "Processing"
  },

  cancelReason: {
  type: String,
  default: ""
}

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);