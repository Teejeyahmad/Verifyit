const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookie = require("cookie-parser");

const { authRoutes, productRoutes, verifyRoutes } = require("./routes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://verifyit-n8gh.vercel.app"], // Replace with your frontend's URL
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookie());

require("./config/database");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/verify", verifyRoutes);

app.get("/", (req, res, next) => {
  res.json({ message: "✅ VerifyIt API is running" });
});
module.exports = { app };
