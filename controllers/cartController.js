const Cart = require("../models/Cart");

// ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const { productId, size, itemId, action } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });

    // 👉 create cart if not exists
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // ===============================
    // 🔥 1. UPDATE QUANTITY ( + / - )
    // ===============================
    if (itemId && action) {
      const item = cart.items.find(
        i => i._id.toString() === itemId
      );

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (action === "inc") {
        item.quantity += 1;
      }

      if (action === "dec" && item.quantity > 1) {
        item.quantity -= 1;
      }

      await cart.save();

      return res.json({
        message: "Quantity updated",
        cart
      });
    }

    // ===============================
    // 🔥 2. ADD NEW PRODUCT
    // ===============================
    if (!productId || !size) {
      return res.status(400).json({ message: "Product & size required" });
    }

    const existing = cart.items.find(
      item =>
        item.product.toString() === productId &&
        item.size === size
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push({
        product: productId,
        size,
        quantity: 1
      });
    }

    await cart.save();

    res.json({
      message: "Added to cart",
      cart
    });

  } catch (err) {
    console.log("ADD TO CART ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product");

  // 🔥 remove invalid products
  if (cart) {
    cart.items = cart.items.filter(item => item.product);
    await cart.save();
  }

  res.json(cart);
};

// REMOVE ITEM
exports.removeFromCart = async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  cart.items = cart.items.filter(i => i._id.toString() !== itemId);

  await cart.save();

  res.json(cart);
};