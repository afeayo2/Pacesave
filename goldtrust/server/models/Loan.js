const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema(
  {
    week: Number,
    amount: Number,
    dueDate: Date,
    day: String,
    status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    paidAt: Date,
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },

    loanSource: { type: String, enum: ["app", "manual"], default: "app" },
    clientName: String,
    phoneNumber: String,

    requestedAmount: { type: Number, required: true },
    approvedAmount: Number,
    interestRate: { type: Number, default: 8 }, // % per month
    totalInterest: Number,
    totalRepayment: Number,
    durationInMonths: { type: Number, default: 3 },

    amountPaid: { type: Number, default: 0 },
    balance: Number,

    creditScore: Number,
    riskClass: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "Unknown"], default: "Unknown" },

    installments: [installmentSchema],

    staffReview: {
      decision: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
      note: String,
      reviewedAt: Date,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    },

    adminNote: String,
    approvedAt: Date,
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

    dueDate: Date,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
