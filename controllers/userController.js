const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { name, contact, email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ msg: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      contact,
      email,
      password: hash,
    });

    await user.save();

    res.json({ message: "Registered Successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid password" });

    const token = jwt.sign(
       { _id: user._id, isAdmin: user.isAdmin }, // 🔥 CHANGE
         process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

    const { password: pass, ...userData } = user._doc;

    res.json({
      token,
      user: userData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const exists = user.wishlist.some(
      (id) => id.toString() === req.params.productId
    );

    if (!exists) {
      user.wishlist.push(req.params.productId);
    }

    await user.save();

    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("wishlist"); // 🔥 important

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ REMOVE
exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.productId
    );

    await user.save();

    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};