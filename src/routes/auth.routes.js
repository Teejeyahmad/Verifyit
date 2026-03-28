const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
} = require("../controllers");
const { authenticate, sanitizeInput } = require("../middleware");
const { uploadProfilePicture } = require("../config/cloudinary");

const authRoutes = express.Router();

authRoutes.use(sanitizeInput);

authRoutes.post(
  "/register",
  uploadProfilePicture.single("profilePicture"),
  register,
);
authRoutes.post("/login", login);
authRoutes.get("/dashboard", authenticate, getMe);
authRoutes.put(
  "/profile",
  authenticate,
  uploadProfilePicture.single("profilePicture"),
  updateProfile,
);
authRoutes.post("/logout", authenticate, logout); // protect runs first to validate token

module.exports = authRoutes;
