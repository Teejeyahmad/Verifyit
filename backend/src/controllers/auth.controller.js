const { BusinessModel, BlacklistedToken } = require("../models");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//creating new error interface for logic errors
class LogicError extends Error {}
const tokenExpiresIn = 60;

const generate_and_send_token = (
  responseBody,
  businessId,
  expiryDateInMins,
) => {
  let token = jwt.sign({ businessId }, process.env.JWT_SECRET, {
    expiresIn: expiryDateInMins * 60,
  });

  // In production (cross-site, HTTPS) we need SameSite=None and Secure=true.
  // In local development on http://localhost, browsers will reject SameSite=None
  // cookies unless Secure is true (HTTPS). Use 'lax' for dev to allow cookie
  // on localhost without HTTPS.
  const isProd = process.env.RAILWAY_ENVIRONMENT_NAME === "production";

  responseBody.cookie("token", token, {
    httpOnly: true,
    secure: isProd, // true in production (requires HTTPS)
    sameSite: isProd ? "none" : "lax",
    maxAge: expiryDateInMins * 60 * 1000,
  });
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile,
      cacNumber,
      nafdacNumber,
      ndleaNumber,
    } = req.body;

    const existing = await BusinessModel.findOne({ email });

    if (existing) throw new LogicError("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePicture = req.file ? req.file.path : "";

    const business = await BusinessModel.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      profilePicture,
      cacNumber,
      nafdacNumber,
      ndleaNumber,
    });

    // // Calculate initial Trust Score
    // await calculateTrustScore(business._id);

    generate_and_send_token(res, business._id, tokenExpiresIn);

    res.status(201).json({
      message: "BusinessModel registered successfully",
      business: {
        id: business._id,
        name: business.name,
        email: business.email,
        mobile: business.mobile,
        profilePicture: business.profilePicture,
        cacNumber: business.cacNumber,
        // trustScore: business.trustScore,
        // isPremium: business.isPremium,
      },
    });
  } catch (error) {
    console.log("FROM REGISTER: ", error);
    if (error instanceof LogicError)
      res.status(400).json({ error: error.message });
    else res.status(500).json({ error: "something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const business = await BusinessModel.findOne({ email });
    if (!business) throw new LogicError("Invalid email or password");

    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) throw new LogicError("Invalid email or password");

    generate_and_send_token(res, business._id, tokenExpiresIn);

    res.json({
      message: "Login successful",
      business: {
        id: business._id,
        name: business.name,
        email: business.email,
        mobile: business.mobile,
        profilePicture: business.profilePicture,
        cacNumber: business.cacNumber,
        // trustScore: business.trustScore,
        // isPremium: business.isPremium,
      },
    });
  } catch (error) {
    console.log("FROM LOGIN: ", error);
    if (error instanceof LogicError)
      res.status(401).json({ error: error.message });
    else res.status(500).json({ error: "something went wrong" });
  }
};

const getMe = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.businessId).select(
      "-password",
    );
    if (!business) throw new Error();
    res.json({ business });
  } catch (error) {
    console.log("FROM GETME: ", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
const changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword)
      return res.status(400).json({ error: "Password doesn't match" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await BusinessModel.findByIdAndUpdate(req.businessId, {
      password: hashedPassword,
    });
    res.json({ message: "password updated successfully!!" });
  } catch (error) {}
};

const updateProfile = async (req, res) => {
  try {
    const { name, mobile, cacNumber, nafdacNumber, ndleaNumber } = req.body;

    const updates = { name, mobile, cacNumber, nafdacNumber, ndleaNumber };

    const allowedUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([Key, value]) => value !== "" && value !== undefined && value != null,
      ),
    );

    if (req.file) allowedUpdates.profilePicture = req.file.path;

    const business = await BusinessModel.findByIdAndUpdate(
      req.businessId,
      allowedUpdates,
      {
        returnDocument: "after",
      },
    ).select("-password");

    if (!business) throw new Error();

    // await calculateTrustScore(req.businessId);

    res.json({ message: "Profile updated", business });
  } catch (error) {
    console.log("FROM UPDATE PROFILE: ", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await BlacklistedToken.create({
        token,
        expiresAt: new Date(decoded.exp * 1000), // JWT exp is in seconds, convert to ms
      });
    }
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("FROM LOGOUT", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  changePassword,
};
