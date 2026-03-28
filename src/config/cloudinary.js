const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();
// Upload_Presets created at cloudinary console(UI)
//"./products" and "./profile"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Product images storage config
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    upload_preset: "product_preset",
  },
});

// Profile picture storage config
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    upload_preset: "profile_preset",
  },
});

const uploadProductImages = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
const uploadProfilePicture = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { cloudinary, uploadProductImages, uploadProfilePicture };
