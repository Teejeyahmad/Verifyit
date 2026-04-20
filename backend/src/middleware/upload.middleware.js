const multer = require("multer");
const {
  uploadProfilePicture,
  uploadProductImages,
} = require("../config/cloudinary");

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          error:
            "File too large. Maximum size is 5MB for product images and 2MB for profile pictures.",
        });

      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          error: "Too many files. Maximum is 5 product images per upload.",
        });

      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          error: `Unexpected field name: "${err.field}". Use "images" for product images and "profilePicture" for profile photos.`,
        });

      case "LIMIT_PART_COUNT":
        return res.status(400).json({
          error: "Too many parts in the form data.",
        });

      default:
        return res.status(400).json({
          error: `Upload error: ${err.message}`,
        });
    }
  }

  if (err) {
    if (err.message.startsWith("Invalid file type")) {
      return res.status(400).json({ error: err.message });
    }

    // Cloudinary-specific errors
    if (err.http_code) {
      switch (err.http_code) {
        case 401:
          return res.status(500).json({
            error:
              "Image upload service authentication failed. Please contact support.",
          });

        case 420:
          return res.status(500).json({
            error: "Image upload limit reached. Please contact support.",
          });

        default:
          return res.status(500).json({
            error: "Image upload failed. Please try again.",
          });
      }
    }

    console.log("FROM HANDLEUPLOADERROR", err);
    return res.status(500).json({
      error: err.message || "Something went wrong during upload",
    });
  }
  next();
};

function handleProfilePicUpload(req, res, next) {
  const upload = uploadProfilePicture.single("profilePicture");
  return upload(req, res, (err) => handleUploadError(err, req, res, next));
}
function handleProductImageUpload(req, res, next) {
  const upload = uploadProductImages.array("images", 5);
  return upload(req, res, (err) => handleUploadError(err, req, res, next));
}
module.exports = { handleProductImageUpload, handleProfilePicUpload };
