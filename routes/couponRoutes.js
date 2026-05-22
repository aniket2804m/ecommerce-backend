// routes/couponRoutes.js
const express = require("express");
const router = express.Router();
const { applyCoupon } = require("../controllers/couponController");
const { verifyUser } = require("../middleware/authMiddleware");

router.post("/apply-coupon", verifyUser, applyCoupon);

module.exports = router;