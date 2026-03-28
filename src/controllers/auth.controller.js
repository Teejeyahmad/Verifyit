const { BusinessModel, BlacklistedToken } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//creating new error interface for logic errors
class LogicError extends Error {}

const generateToken = (businessId) => {
  return jwt.sign({ businessId }, process.env.JWT_SECRET, { expiresIn: "7d" });
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

    const token = generateToken(business._id);

    res.status(201).json({
      message: "BusinessModel registered successfully",
      token,
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

    const token = generateToken(business._id);

    res.json({
      message: "Login successful",
      token,
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
    res.json({ business });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, mobile, cacNumber, nafdacNumber, ndleaNumber } = req.body;
    const updates = { name, mobile, cacNumber, nafdacNumber, ndleaNumber };

    if (req.file) updates.profilePicture = req.file.path;

    const business = await BusinessModel.findByIdAndUpdate(
      req.businessId,
      updates,
      {
        returnDocument: "after",
      },
    ).select("-password");

    // await calculateTrustScore(req.businessId);

    res.json({ message: "Profile updated", business });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    // Decode the token to get its expiry time
    // We don't need to verify here — we already did that in protect middleware
    const decoded = jwt.decode(token);

    // Store the token in the blacklist until it naturally expires
    await BlacklistedToken.create({
      token,
      expiresAt: new Date(decoded.exp * 1000), // JWT exp is in seconds, convert to ms
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { register, login, getMe, updateProfile, logout };
