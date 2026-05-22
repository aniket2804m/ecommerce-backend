const Category = require("../models/Category");

// ADD CATEGORY WITH IMAGE
exports.addCategory = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const { name, parent } = req.body;

    const category = new Category({
      name,
      image: req.file?.path || "",
      parent: parent || null,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category Added",
      category,
    });

  } catch (err) {
    console.log("CATEGORY ERROR =>", err);

    res.status(500).json({
      error: err.message || "Server Error",
    });
  }
};

// GET ALL
exports.getCategories = async (req, res) => {
  const data = await Category.find().populate("parent");;
  res.json(data);
};

exports.getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;

    let updateData = { name };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ❌ DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ msg: "Category Deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};