const jwt = require("jsonwebtoken");
const { BlacklistedToken } = require("../models");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated. Please login." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Check if token has been blacklisted (user already logged out)
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ error: "Session expired. Please login again." });
    }

    // Verify the token is valid and not tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.businessId = decoded.businessId;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ error: "Invalid or expired token. Please login again." });
  }
};
module.exports = authenticate;
