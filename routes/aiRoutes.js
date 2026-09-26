const express = require("express");
const router = express.Router();
const { 
  runModelTraining, 
  predictProductSales,
  predictSize,
  completeTheLook,
  chatStylist,
  visualSearch
} = require("../controllers/aiController");

// Sales Prediction Routes (Step 1-10)
router.post("/train", runModelTraining);
router.post("/predict", predictProductSales);

// Feature 1: AI Size & Fit Advisor
router.post("/size-advisor", predictSize);

// Feature 2: Complete The Look (AI Outfit Combos)
router.post("/complete-look", completeTheLook);

// Feature 3: AI Personal Fashion Stylist Chatbot
router.post("/chat-stylist", chatStylist);

// Feature 4: AI Visual Search / Image Finder
router.post("/visual-search", visualSearch);

module.exports = router;
