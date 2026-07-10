const mongoose = require("mongoose");
const passwordHash = require("./plugins/passwordHash");

const adminSchema = new mongoose.Schema(
  {
    fullName: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: String,
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

passwordHash(adminSchema);

module.exports = mongoose.model("Admin", adminSchema);
