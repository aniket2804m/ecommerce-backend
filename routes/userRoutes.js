const router = require("express").Router();
const ctrl = require("../controllers/userController");
const { verifyUser } = require("../middleware/authMiddleware");

router.post("/register", ctrl.registerUser);
router.post("/login", ctrl.loginUser);


router.post("/wishlist/:productId", verifyUser, ctrl.addToWishlist);
router.delete("/wishlist/:productId", verifyUser, ctrl.removeFromWishlist);


router.get("/me", verifyUser, ctrl.getMe);

module.exports = router;