const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  removeFromCart
} = require("../controllers/cartController");

const { verifyUser } = require("../middleware/authMiddleware");

router.post("/", verifyUser, addToCart);
router.get("/", verifyUser, getCart);
router.delete("/:itemId", verifyUser, removeFromCart);

module.exports = router;