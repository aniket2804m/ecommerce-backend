const router = require("express").Router();
const ctrl = require("../controllers/reviewController");
const upload = require("../middleware/upload");


router.post("/", upload.array("images"), ctrl.addReview);

router.get("/:productId", ctrl.getReviews);


module.exports = router;