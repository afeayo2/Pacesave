const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn(
      "⚠️  MONGO_URI is not set. Add it to server/.env — the API will start but every database call will fail until it's configured."
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}

module.exports = connectDB;
