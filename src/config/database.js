const mongooose = require("mongoose");
require("dotenv").config();

connectDB = async () => {
  await mongooose.connect(process.env.MONGO_URI);
};

connectDB()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
