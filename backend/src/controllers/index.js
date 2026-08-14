const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  changePassword,
} = require("./auth.controller");
const {
  addProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("./product.controller");
const { verifyProduct, verifyCarton } = require("./verify.controller");
const { getLatestDisplay } = require("./display.controller");

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  verifyProduct,
  verifyCarton,
  addProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  logout,
  changePassword,
  getLatestDisplay,
};
