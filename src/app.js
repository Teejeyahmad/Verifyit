const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { authRoutes, productRoutes, verifyRoutes } = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/verify", verifyRoutes);

app.get("/", (req, res) => {
  res.json({ message: "✅ VerifyIt API is running" });
});

module.exports = { app };
