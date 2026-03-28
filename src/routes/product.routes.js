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

productRoutes.use(sanitizeInput, authenticate);

productRoutes.post("/", uploadProductImages.array("images", 5), addProduct);
productRoutes.get("/", getProducts);
productRoutes.get("/:id", getProduct);
productRoutes.put(
  "/:id",
  uploadProductImages.array("images", 5),
  updateProduct,
);
productRoutes.delete("/:id", deleteProduct);

module.exports = productRoutes;
