const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Product images storage config
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const identifier = req.businessId;
    const publicId = `${identifier}_product`;

    return {
      upload_preset: "product_preset",
      public_id: publicId,
    };
  },
});

// Profile picture storage config
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    // const identifier = req.body.email.replace(/[@.]/g, "_");
    const identifier = req.businessId;
    const publicId = `${identifier}_profile`;
    return {
      upload_preset: "profile_preset",
      public_id: publicId,
    };
  },
});

const uploadProductImages = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});

const uploadProfilePicture = multer({
  storage: profileStorage,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
});

module.exports = { cloudinary, uploadProductImages, uploadProfilePicture };
