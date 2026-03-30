const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "a valid name required"],
      trim: true,
      minLength: 4,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, "provide an email address"],
      unique: true,
      lowercase: true,
      trim: true,
      minLength: 3,
      maxLength: 50,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 100,
      trim: true,
    },
    mobile: { type: String, required: true, trim: true },
    profilePicture: { type: String, default: "" },
    cacNumber: { type: String, trim: true, default: "" },
    cacVerified: { type: Boolean, default: false },
    nafdacNumber: { type: String, trim: true, default: "" },
    ndleaNumber: { type: String, trim: true, default: "" },
    // trustScore: { type: Number, default: 0 },
    // isPremium: { type: Boolean, default: false },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Business", businessSchema);
