require("dotenv").config();

const express = require("express");
const cors = require("cors");

const couponRoutes = require("./routes/couponRoutes");

const connectDB = require("./config/db");
const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));

app.use("/api", couponRoutes);

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// Port
const PORT = process.env.PORT || 5000;

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});