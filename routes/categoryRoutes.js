const router = require("express").Router();
const ctrl = require("../controllers/categoryController");
const upload = require("../middleware/upload");
const { verifyUser, verifyAdmin } = require("../middleware/authMiddleware");

// 🔥 upload.single important
router.post(
  "/",
  verifyUser,
  verifyAdmin,
  upload.single("image"),
  ctrl.addCategory
);

router.get("/", ctrl.getCategories);
router.get("/:id", ctrl.getSingleCategory);


// UPDATE
router.put(
  "/:id",
  verifyUser,
  verifyAdmin,
  upload.single("image"),
  ctrl.updateCategory
);

// DELETE
router.delete(
  "/:id",
  verifyUser,
  verifyAdmin,
  ctrl.deleteCategory
);

router.get("/:id", ctrl.getSingleCategory);

module.exports = router;