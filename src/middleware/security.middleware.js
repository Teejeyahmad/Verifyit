const validator = require("validator");
const mongoose = require("mongoose");
class LogicError extends Error {}

const sanitizeInput = (req, res, next) => {
  try {
    const params = req.params;
    const {
      name,
      email,
      password,
      mobile,
      cacNumber,
      nafdacNumber,
      ndleaNumber,
      description,
      category,
      batch,
      expiryDate,
    } = req.body;

    if (params && !mongoose.isValidObjectId(params.productId)) {
      return res.status(400).json({
        verified: false,
        message: "Invalid QR code",
      });
    }
    if (email && !validator.isEmail(email))
      throw new LogicError("Invalid Email format");
    if (password && !validator.isStrongPassword(password))
      throw new LogicError("Use a stronger Password");
    if (mobile && !validator.isMobilePhone(mobile, ["en-NG"]))
      throw new LogicError("Invalid Mobile Number");
    next();
  } catch (error) {
    if (error instanceof LogicError)
      res.status(400).json({ error: error.message });
    else res.status(500).json({ error: "something went wrong" });
  }
};

module.exports = sanitizeInput;
