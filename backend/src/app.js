const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookie = require("cookie-parser");
const scanRoutes = require("./routes/scan.routes");

const { authRoutes, productRoutes, verifyRoutes } = require("./routes");
const displayRoutes = require("./routes/display.routes");

const app = express();

app.use(
  cors({
    origin: [
      "http://10.125.252.46:5173",
      "http://localhost:5173",
      "https://verifyit.up.railway.app",
      "https://verifyit2.up.railway.app"
    ], // Replace with your frontend's URL
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookie());

require("./config/database");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/display", displayRoutes);

app.get("/", (req, res, next) => {
  res.json({ message: "✅ VerifyIt API is running" });
});
module.exports = { app };
