const express = require("express");
const {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers");

const {
  authenticate,
  sanitizeInput,
  handleProductImageUpload,
} = require("../middleware");

const productRoutes = express.Router();

productRoutes.use(authenticate);

productRoutes.post("/", handleProductImageUpload, sanitizeInput, addProduct);
productRoutes.get("/", getProducts);
productRoutes.get("/:id", sanitizeInput, getProduct);
productRoutes.patch(
  "/:id",
  handleProductImageUpload,
  sanitizeInput,
  updateProduct,
);

productRoutes.delete("/:id", sanitizeInput, deleteProduct);

module.exports = productRoutes;
