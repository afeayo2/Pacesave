const mongoose = require("mongoose");
const passwordHash = require("./plugins/passwordHash");

const clientSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    dateOfBirth: String,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    maritalStatus: String,
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    balance: { type: Number, default: 0 },

    address: {
      street: String,
      city: String,
      lga: String,
      state: String,
      landmark: String,
    },

    idType: String,
    idNumber: String,
    bvn: String,

    savings: {
      type: { type: String, enum: ["Daily", "Weekly", "Monthly"], default: "Daily" },
      targetAmount: { type: Number, default: 0 },
      duration: { type: String, default: "" },
      method: { type: String, default: "Cash" },
    },

    nextOfKin: {
      fullName: String,
      relationship: String,
      phone: String,
      address: String,
    },

    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
    onboardedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
    onboardedAt: { type: Date, default: Date.now },

    status: { type: String, enum: ["active", "flagged", "inactive"], default: "active" },

    resetOtp: String,
    resetOtpExpires: Date,
  },
  { timestamps: true }
);

passwordHash(clientSchema);

module.exports = mongoose.model("Client", clientSchema);
