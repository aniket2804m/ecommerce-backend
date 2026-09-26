const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ USER AUTH CHECK
exports.verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token, access denied", msg: "No token, access denied" });
    }

    const actualToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

    if (!actualToken) {
      return res.status(401).json({ message: "Invalid token format", msg: "Invalid token format" });
    }

    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET || "defaultsecret");

    const user = await User.findById(decoded._id || decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found", msg: "User not found" });
    }

    req.user = user; // 🔥 FULL USER OBJECT

    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token", msg: "Invalid token", error: err.message });
  }
};



// ✅ ADMIN CHECK
exports.verifyAdmin = (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required", msg: "Admin only access" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message, error: err.message });
  }
};