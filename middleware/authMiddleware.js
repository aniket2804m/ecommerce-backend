const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ USER AUTH CHECK
exports.verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ msg: "No token, access denied" });
    }

    const actualToken = token.split(" ")[1];

    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    // 🔥 USER FETCH FROM DB
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = user; // 🔥 FULL USER OBJECT

    next();

  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};



// ✅ ADMIN CHECK
exports.verifyAdmin = (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin only access" });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};