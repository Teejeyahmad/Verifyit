const { DisplayQueueModel } = require("../models");

// ESP32 calls this every 2 seconds
// Returns the latest scan if it's newer than the timestamp the ESP32 last saw
const getLatestDisplay = async (req, res) => {
  try {
    // ESP32 sends ?after=UNIX_TIMESTAMP_MS
    const after = req.query.after
      ? new Date(Number(req.query.after))
      : new Date(Date.now() - 5000); // default: last 5 seconds

    const latest = await DisplayQueueModel.findOne({
      scannedAt: { $gt: after },
    }).sort({ scannedAt: -1 });

    if (!latest) {
      return res.json({ hasNew: false });
    }

    res.json({
      hasNew: true,
      productName: latest.productName,
      registeredBy: latest.registeredBy,
      isFirstScan: latest.isFirstScan,
      isCarton: latest.isCarton,
      scannedAt: latest.scannedAt.getTime(), // send back as ms timestamp
    });
  } catch (error) {
    res.status(500).json({ hasNew: false, error: "Something went wrong" });
  }
};

module.exports = { getLatestDisplay };
