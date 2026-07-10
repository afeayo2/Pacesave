const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "FrontDesk" },
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: "Loan" },
    note: String,
    outcome: {
      type: String,
      enum: ["answered", "no-answer", "promised-to-pay", "wrong-number"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallLog", callLogSchema);
