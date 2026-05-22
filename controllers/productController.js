const Category = require("../models/Category");
const Product = require("../models/Product");

// ================= ADD PRODUCT =================
exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      infoText,
      discount,
      category,
      description,
      tag,
      sizes,
      specifications
    } = req.body;

    const files = req.files || [];

    // COLORS
    const colorNames = Array.isArray(req.body.colors)
      ? req.body.colors
      : [req.body.colors];

    const imageCounts = Array.isArray(req.body.imageCounts)
      ? req.body.imageCounts.map(Number)
      : [Number(req.body.imageCounts)];

    // 🔥 NEW: color-wise specs
    let allColorSpecs = [];
    try {
      allColorSpecs = req.body.colorSpecifications
        ? JSON.parse(req.body.colorSpecifications)
        : [];
    } catch {
      allColorSpecs = [];
    }

    let colorsData = [];
    let index = 0;

    colorNames.forEach((color, i) => {
      const count = imageCounts[i] || 0;

      const images = [];

      for (let j = 0; j < count; j++) {
        if (files[index]) {
          images.push(files[index].path);
          index++;
        }
      }

      colorsData.push({
        name: color,
        images: images,
        specifications: allColorSpecs[i] || [] // ✅ MAIN CHANGE
      });
    });

    // PARSE
    let parsedSizes = [];
    let parsedSpecs = [];

    try {
      parsedSizes = sizes ? JSON.parse(sizes) : [];
    } catch {}

    try {
      parsedSpecs = specifications ? JSON.parse(specifications) : [];
    } catch {}

    // PRICE LOGIC
    let finalPrice = Number(price);
    let discountValue = discount ? Number(discount) : 0;
    let originalPrice = finalPrice;

    if (discountValue > 0) {
      originalPrice = Math.round(
        finalPrice / (1 - discountValue / 100)
      );
    }

    const product = new Product({
      name,
      price: originalPrice,
      discount,
      finalPrice,
      category,
      description,
      tag,
      colors: colorsData,
      sizes: parsedSizes,
      specifications: parsedSpecs, // fallback
      infoText
    });

    await product.save();

    res.json(product);

  } catch (err) {
    console.log("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET ALL =================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LATEST =================
exports.getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CATEGORY =================
exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const subCategories = await Category.find({ parent: categoryId });

    const ids = [categoryId, ...subCategories.map(c => c._id)];

    const products = await Product.find({
      category: { $in: ids }
    }).populate("category");

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SINGLE =================
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE =================
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      discount,
      infoText,
      category,
      description,
      tag,
      sizes,
      specifications
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name & Price required" });
    }

    const files = req.files || [];

    const colorNames = Array.isArray(req.body.colors)
      ? req.body.colors
      : [req.body.colors];

    const imageCounts = Array.isArray(req.body.imageCounts)
      ? req.body.imageCounts.map(Number)
      : [Number(req.body.imageCounts)];

    const existingImagesArr = Array.isArray(req.body.existingImages)
      ? req.body.existingImages
      : [req.body.existingImages];

    // 🔥 NEW: color-wise specs
    let allColorSpecs = [];
    try {
      allColorSpecs = req.body.colorSpecifications
        ? JSON.parse(req.body.colorSpecifications)
        : [];
    } catch {
      allColorSpecs = [];
    }

    let colorsData = [];
    let index = 0;

    colorNames.forEach((color, i) => {
      const count = imageCounts[i] || 0;

      let oldImages = [];
      try {
        oldImages = existingImagesArr[i]
          ? JSON.parse(existingImagesArr[i])
          : [];
      } catch {}

      let newImages = [];
      for (let j = 0; j < count; j++) {
        if (files[index]) {
          newImages.push(files[index].path);
          index++;
        }
      }

      colorsData.push({
        name: color,
        images: [...oldImages, ...newImages],
        specifications: allColorSpecs[i] || [] // ✅ MAIN CHANGE
      });
    });

    let parsedSizes = sizes ? JSON.parse(sizes) : [];
    let parsedSpecs = specifications ? JSON.parse(specifications) : [];

    let finalPrice = Number(price);
    let originalPrice = finalPrice;

    if (discount > 0) {
      originalPrice = Math.round(finalPrice / (1 - discount / 100));
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price: originalPrice,
        discount,
        finalPrice,
        category,
        infoText,
        description,
        tag,
        colors: colorsData,
        sizes: parsedSizes,
        specifications: parsedSpecs
      },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE =================
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= BY IDS =================
exports.getProductsByIds = async (req, res) => {
  try {
    const products = await Product.find({
      _id: { $in: req.body.ids }
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};