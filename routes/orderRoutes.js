const express = require("express");
const router = express.Router();

const { placeOrder,getUserOrders,getAllOrders,updateOrderStatus,cancelOrder, createRazorpayOrder,verifyAndSaveOrder } = require("../controllers/orderController");
const { verifyUser,verifyAdmin } = require("../middleware/authMiddleware");

router.post("/", verifyUser, placeOrder);
router.get("/my-orders", verifyUser, getUserOrders);

router.get("/admin", verifyUser, verifyAdmin, getAllOrders);
router.put("/status/:id", verifyUser, verifyAdmin, updateOrderStatus);
router.put("/cancel/:id", verifyUser, cancelOrder);
router.post("/razorpay", verifyUser, createRazorpayOrder);
router.post("/verify", verifyUser, verifyAndSaveOrder);

module.exports = router;