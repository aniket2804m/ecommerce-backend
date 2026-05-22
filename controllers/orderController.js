const sendOrderEmails = require("../utils/sendEmail");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Razorpay = require("razorpay");
const User = require("../models/User");
const Product = require("../models/Product");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });



exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = req.body.items;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items selected" });
    }

    
    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        return { ...item, product };
      })
    );

    
    let total = populatedItems.reduce(
      (sum, item) => sum + item.product.finalPrice * item.quantity,
      0
    );

    let delivery = 0;
    if (req.body.paymentMethod === "cod") {
      delivery = 70;
      total += delivery;
    }

    
    let discount = 0;
    if (req.body.couponCode === "WELCOME100") {
      const user = await User.findById(userId);
      if (user.isFirstOrder) {
        discount = 100;
        user.isFirstOrder = false;
        await user.save();
      }
    }

    const subtotal = total;
    total = Math.max(total - discount, 0);

    
    if (req.body.paymentMethod === "razorpay") {
      const order = await razorpay.orders.create({
        amount: total * 100,
        currency: "INR"
      });

      return res.json({
        razorpayOrderId: order.id,
        amount: total
      });
    }

   
    const order = new Order({
      user: userId,
      items: items,
      totalAmount: total,
      billingDetails: req.body.billingDetails,
      paymentMethod: req.body.paymentMethod
    });

    await order.save();

    
    const cart = await Cart.findOne({ user: userId });

    if (cart) {
      cart.items = cart.items.filter(cartItem =>
        !items.some(selected =>
          selected._id.toString() === cartItem._id.toString()
        )
      );
      await cart.save();
    }

    const user = await User.findById(userId);

    
    sendOrderEmails({
  customerEmail: user.email,
  orderId: order._id,
  items: populatedItems.map(item => ({
    name: item.product.name,
    qty: item.quantity,
    price: item.product.finalPrice
  })),
  subtotal,
  discount,
  delivery,
  total
}).catch(err => console.log("Mail Error:", err));

    
    res.json({
      message: "Order placed",
      orderId: order._id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};


exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: "Cancelled",
        cancelReason: reason
      },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = req.body.items;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items selected" });
    }

    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        return { ...item, product };
      })
    );

    let total = populatedItems.reduce(
      (sum, item) => sum + item.product.finalPrice * item.quantity,
      0
    );

    let discount = 0;

    if (req.body.couponCode === "WELCOME100") {
      const user = await User.findById(userId);
      if (user.isFirstOrder) {
        discount = 100;
      }
    }

    total = Math.max(total - discount, 0);

    const order = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR"
    });

    res.json({
      razorpayOrderId: order.id,
      amount: total
    });

  } catch (err) {
    console.log("RAZORPAY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.verifyAndSaveOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = req.body.items;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items selected" });
    }

   
    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        return { ...item, product };
      })
    );

   
    let total = populatedItems.reduce(
      (sum, item) => sum + item.product.finalPrice * item.quantity,
      0
    );

    let discount = 0;

    if (req.body.couponCode === "WELCOME100") {
      const user = await User.findById(userId);

      if (user.isFirstOrder) {
        discount = 100;
        user.isFirstOrder = false;
        await user.save();
      }
    }

    const subtotal = total;
    total = Math.max(total - discount, 0);

    
    const order = new Order({
      user: userId,
      items: items,
      totalAmount: total,
      billingDetails: req.body.billingDetails,
      paymentMethod: "razorpay"
    });

    await order.save();

    
    const cart = await Cart.findOne({ user: userId });

    if (cart) {
      cart.items = cart.items.filter(cartItem =>
        !items.some(selected =>
          selected._id.toString() === cartItem._id.toString()
        )
      );
      await cart.save();
    }

    const user = await User.findById(userId);

res.json({
  message: "Order placed",
  orderId: order._id
});


sendOrderEmails({
  customerEmail: user.email,
  orderId: order._id,
  items: populatedItems.map(item => ({
    name: item.product.name,
    qty: item.quantity,
    price: item.product.finalPrice
  })),
  subtotal,
  discount,
  delivery,
  total
}).catch(err => console.log("Mail Error:", err));

   
    res.json({ message: "Order saved" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};