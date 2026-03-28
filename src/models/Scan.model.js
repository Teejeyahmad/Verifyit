const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    qrType: {
      type: String,
      enum: ["unit", "carton"],
      default: "unit",
    },
    userAgent: { type: String, maxLength: 100 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Scan", scanSchema);
