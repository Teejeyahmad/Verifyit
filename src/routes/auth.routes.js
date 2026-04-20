const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  changePassword,
} = require("../controllers");

const {
  authenticate,
  sanitizeInput,
  handleProfilePicUpload,
} = require("../middleware");

const authRoutes = express.Router();

authRoutes.post("/register", handleProfilePicUpload, sanitizeInput, register);
authRoutes.post("/login", login);
authRoutes.get("/dashboard", authenticate, getMe);
authRoutes.patch(
  "/profile",
  authenticate,
  handleProfilePicUpload,
  updateProfile,
);
authRoutes.patch("/password", authenticate, changePassword);
authRoutes.post("/logout", authenticate, logout);

module.exports = authRoutes;
