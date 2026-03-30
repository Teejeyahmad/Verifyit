const express = require("express");
const {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers");
const { authenticate, sanitizeInput } = require("../middleware");
const { uploadProductImages } = require("../config/cloudinary");

const productRoutes = express.Router();

productRoutes.use(authenticate);

productRoutes.post(
  "/",
  uploadProductImages.array("images", 5),
  sanitizeInput,
  addProduct,
);
productRoutes.get("/", getProducts);
productRoutes.get("/:id", sanitizeInput, getProduct);
productRoutes.patch(
  "/:id",
  uploadProductImages.array("images", 5),
  sanitizeInput,
  updateProduct,
);
productRoutes.delete("/:id", sanitizeInput, deleteProduct);

module.exports = productRoutes;
