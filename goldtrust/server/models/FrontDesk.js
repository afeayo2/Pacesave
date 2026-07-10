const mongoose = require("mongoose");
const passwordHash = require("./plugins/passwordHash");

const frontDeskSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "frontdesk" },
  },
  { timestamps: true }
);

passwordHash(frontDeskSchema);

module.exports = mongoose.model("FrontDesk", frontDeskSchema);
