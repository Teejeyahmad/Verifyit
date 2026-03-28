const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 4,
      maxLength: 50,
    },
    description: { type: String, trim: true, maxLength: 500 },
    category: {
      type: String,
      enum: ["drug", "food", "cosmetic", "supplement", "other"],
      default: "other",
    },
    batch: { type: String, trim: true, maxLength: 50 },
    expiryDate: { type: Date },
    nafdacNumber: { type: String, trim: true, maxLength: 50 },
    ndleaNumber: { type: String, trim: true, maxLength: 50 },
    images: [{ type: String }],
    unitQrCode: { type: String, trim: true, maxLength: 100 },
    cartonQrCode: { type: String, trim: true, maxLength: 100 },
    scanCount: { type: Number, default: 0 },
    firstScannedAt: { type: Date, default: null },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Product", productSchema);
