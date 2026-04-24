const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookie = require("cookie-parser");

const { authRoutes, productRoutes, verifyRoutes } = require("./routes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://verifyit-n8gh.vercel.app",
      "https://verifyit-enk9.vercel.app",
    ], // Replace with your frontend's URL
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookie());

require("./config/database");

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/verify", verifyRoutes);

app.get("/test", (req, res, next) => {
  res.json({ message: "✅ VerifyIt API is running" });
});
module.exports = { app };
