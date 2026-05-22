const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Product = require("../models/Product");

const {
  addProduct,
  getAllProducts,
  getProductsByCategory,
  getLatestProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProductsByIds
} = require("../controllers/productController");

const { verifyUser, verifyAdmin } = require("../middleware/authMiddleware");

router.get("/search", async (req, res) => {
  const q = req.query.q;

  try {
    const products = await Product.find({
      name: { $regex: q, $options: "i" }
    }).populate("category"); 

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN
router.post(
  "/",
  verifyUser,
  verifyAdmin,
  upload.array("images"), 
  addProduct
);

// PUBLIC
router.get("/", getAllProducts);
router.get("/latest", getLatestProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getSingleProduct);
router.put(
  "/:id",
  verifyUser,
  verifyAdmin,
  upload.array("images"), 
  updateProduct
);
router.delete("/:id", verifyUser, verifyAdmin, deleteProduct);
router.post("/by-ids", getProductsByIds);



module.exports = router;