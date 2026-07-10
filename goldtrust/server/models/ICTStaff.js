const mongoose = require("mongoose");
const passwordHash = require("./plugins/passwordHash");

const ictStaffSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "ict", enum: ["ict", "super-ict"] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

passwordHash(ictStaffSchema);

module.exports = mongoose.model("ICTStaff", ictStaffSchema);
