const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  changePassword,
} = require("../controllers");
const { authenticate, sanitizeInput } = require("../middleware");
const { uploadProfilePicture } = require("../config/cloudinary");
const authRoutes = express.Router();

authRoutes.post(
  "/register",
  uploadProfilePicture.single("profilePicture"),
  sanitizeInput,
  register,
);
authRoutes.post("/login", login);
authRoutes.get("/dashboard", authenticate, getMe);
authRoutes.patch(
  "/profile",
  authenticate,
  uploadProfilePicture.single("profilePicture"),
  updateProfile,
);
authRoutes.patch("/password", authenticate, changePassword);
authRoutes.post("/logout", authenticate, logout);

module.exports = authRoutes;
