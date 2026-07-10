const mongoose = require("mongoose");
const passwordHash = require("./plugins/passwordHash");

const staffSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "staff" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

passwordHash(staffSchema);

module.exports = mongoose.model("Staff", staffSchema);
