const express = require("express");
const { verifyProduct, verifyCarton } = require("../controllers");
const { sanitizeInput } = require("../middleware");
const verifyRoutes = express.Router();

verifyRoutes.use(sanitizeInput);
verifyRoutes.get("/:id", verifyProduct);
verifyRoutes.get("/:id/carton", verifyCarton);

module.exports = verifyRoutes;
