require("dotenv").config();
const mongoose = require("mongoose");
console.log("MONGO_URI:", process.env.MONGO_URI);

connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

connectDB()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
