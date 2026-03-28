const express = require("express");
const { verifyProduct, verifyCarton } = require("../controllers");
const { sanitizeInput } = require("../middleware");
const verifyRoutes = express.Router();

verifyRoutes.use(sanitizeInput);
verifyRoutes.get("/:productId", verifyProduct);
verifyRoutes.get("/:productId/carton", verifyCarton);

module.exports = verifyRoutes;
