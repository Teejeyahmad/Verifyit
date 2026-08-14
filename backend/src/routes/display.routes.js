const express = require("express");
const { getLatestDisplay } = require("../controllers");

const displayRoutes = express.Router();

// No auth — ESP32 can't easily handle JWT
// The endpoint only returns public product info anyway
displayRoutes.get("/latest", getLatestDisplay);

module.exports = displayRoutes;
