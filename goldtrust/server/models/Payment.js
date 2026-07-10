const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    clientName: String,
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: "Loan", default: null },

    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["cash", "card", "loan-disbursement", "loan-repayment", "savings-deposit"],
      required: true,
    },
    installmentWeek: Number,
    reference: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
