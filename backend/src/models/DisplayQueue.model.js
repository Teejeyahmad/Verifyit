const mongoose = require("mongoose");

const displayQueueSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  registeredBy: { type: String, default: "" },
  isFirstScan: { type: Boolean, default: true },
  isCarton: { type: Boolean, default: false },
  scannedAt: { type: Date, default: Date.now },
});

// Auto-delete after 5 minutes — no need to keep stale display data
displayQueueSchema.index({ scannedAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model("DisplayQueue", displayQueueSchema);
