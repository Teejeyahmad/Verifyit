const express = require("express");
const { decodeAndVerify } = require("../controllers/scan.controller");

const router = express.Router();

// Receives raw JPEG bytes — not JSON, not multipart
// express.raw() parses the raw binary body
router.post(
  "/decode",
  express.raw({
    type: ["image/png", "image/jpeg", "image/jpg"],
    limit: "200kb",
  }),
  decodeAndVerify,
);

module.exports = router;
