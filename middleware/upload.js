const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    return {
      folder: "categories",

      format: "png",

      public_id: Date.now() + "-category",
    };
  },
});

const upload = multer({
  storage,
});

module.exports = upload;