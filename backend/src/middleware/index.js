const authenticate = require("./auth.middleware");
const sanitizeInput = require("./security.middleware");
const {
  handleProductImageUpload,
  handleProfilePicUpload,
} = require("./upload.middleware");

module.exports = {
  sanitizeInput,
  authenticate,
  handleProfilePicUpload,
  handleProductImageUpload,
};
