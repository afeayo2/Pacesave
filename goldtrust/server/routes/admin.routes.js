const express = require("express");
const router = express.Router();

const Client = require("../models/Client");
const Loan = require("../models/Loan");
const Payment = require("../models/Payment");
const Withdrawal = require("../models/Withdrawal");
const Staff = require("../models/Staff");
const { protect } = require("../middleware/auth");

router.get("/overview", protect(["admin"]), async (req, res) => {
  const [clients, staff, activeLoans, pendingLoans, pendingWithdrawals, payments, clientsAgg] = await Promise.all([
    Client.countDocuments(),
    Staff.countDocuments({ isActive: true }),
    Loan.countDocuments({ status: "active" }),
    Loan.countDocuments({ status: "pending" }),
    Withdrawal.countDocuments({ status: "pending" }),
    Payment.find(),
    Client.aggregate([{ $group: { _id: null, totalSavings: { $sum: "$balance" } } }]),
  ]);

  const loansAgg = await Loan.aggregate([
    { $match: { status: { $in: ["active", "paid"] } } },
    { $group: { _id: null, outstanding: { $sum: "$balance" }, disbursed: { $sum: "$approvedAmount" } } },
  ]);

  res.json({
    totalClients: clients,
    activeStaff: staff,
    activeLoans,
    pendingLoans,
    pendingWithdrawals,
    totalSavings: clientsAgg[0]?.totalSavings || 0,
    totalCollected: payments.reduce((s, p) => s + p.amount, 0),
    totalDisbursed: loansAgg[0]?.disbursed || 0,
    totalOutstanding: loansAgg[0]?.outstanding || 0,
  });
});

router.get("/clients", protect(["admin"]), async (req, res) => {
  const clients = await Client.find().select("-password").sort({ createdAt: -1 }).limit(300);
  res.json(clients);
});

module.exports = router;
