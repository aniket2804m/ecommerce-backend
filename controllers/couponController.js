const User = require("../models/User");

exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // ✅ only new user
    if (!user.isFirstOrder) {
      return res.status(400).json({ msg: "Only for new users" });
    }

    // ✅ coupon check
    if (code !== "WELCOME100") {
      return res.status(400).json({ msg: "Invalid coupon" });
    }

    res.json({
      success: true,
      discount: 100
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};