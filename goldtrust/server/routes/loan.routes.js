const express = require("express");
const router = express.Router();

const Loan = require("../models/Loan");
const Client = require("../models/Client");
const Payment = require("../models/Payment");
const { protect } = require("../middleware/auth");
const { scoreClient, buildLoanOffer } = require("../utils/loanEngine");

/* ============ CLIENT: PREVIEW A LOAN OFFER ============ */
router.post("/preview", protect(["client"]), async (req, res) => {
  const { amount, durationInMonths } = req.body;
  const client = await Client.findById(req.user.id);
  if (!client) return res.status(404).json({ message: "Client not found" });

  const existing = await Loan.findOne({
    clientId: client._id,
    status: { $in: ["pending", "approved", "active"] },
  });
  if (existing) {
    return res.status(400).json({ eligible: false, message: "You already have an active or pending loan" });
  }

  const { creditScore, riskClass } = scoreClient(client);

  if (creditScore < 500 || riskClass === "HIGH") {
    return res.status(200).json({
      eligible: false,
      message: "Not eligible for a loan yet. Keep saving to build your credit score.",
      creditScore,
      riskClass,
    });
  }

  const offer = buildLoanOffer({ requestedAmount: Number(amount), durationInMonths, creditScore });

  res.json({ eligible: true, creditScore, riskClass, requestedAmount: Number(amount), ...offer });
});

/* ============ CLIENT: CONFIRM / SUBMIT LOAN REQUEST ============ */
router.post("/confirm", protect(["client"]), async (req, res) => {
  const { amount, durationInMonths } = req.body;
  const client = await Client.findById(req.user.id);
  if (!client) return res.status(404).json({ message: "Client not found" });

  const { creditScore, riskClass } = scoreClient(client);
  const offer = buildLoanOffer({ requestedAmount: Number(amount), durationInMonths, creditScore });

  const loan = await Loan.create({
    clientId: client._id,
    staffId: client.staffId,
    loanSource: "app",
    clientName: client.fullName,
    phoneNumber: client.phone,
    requestedAmount: Number(amount),
    approvedAmount: offer.approvedAmount,
    interestRate: offer.interestRate,
    totalInterest: offer.totalInterest,
    totalRepayment: offer.totalRepayment,
    durationInMonths: offer.durationInMonths,
    balance: offer.totalRepayment,
    creditScore,
    riskClass,
    installments: offer.installments,
    dueDate: offer.dueDate,
    status: "pending",
  });

  res.status(201).json(loan);
});

/* ============ CLIENT: MY LOANS ============ */
router.get("/mine", protect(["client"]), async (req, res) => {
  const loans = await Loan.find({ clientId: req.user.id }).sort({ createdAt: -1 });
  res.json(loans);
});

/* ============ STAFF/ADMIN: LIST LOANS ============ */
router.get("/", protect(["staff", "admin", "frontdesk"]), async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (req.user.role === "staff") filter.staffId = req.user.id;

  const loans = await Loan.find(filter).populate("clientId", "fullName phone").sort({ createdAt: -1 });
  res.json(loans);
});

/* ============ STAFF/ADMIN: DEFAULTERS (overdue unpaid installments) ============ */
router.get("/defaulters", protect(["staff", "admin", "frontdesk"]), async (req, res) => {
  const filter = { status: "active" };
  if (req.user.role === "staff") filter.staffId = req.user.id;

  const loans = await Loan.find(filter).populate("clientId", "fullName phone");
  const now = new Date();

  const defaulters = loans
    .map((loan) => {
      const overdue = loan.installments.filter((i) => i.status === "unpaid" && new Date(i.dueDate) < now);
      return overdue.length ? { loan, overdueCount: overdue.length, overdueAmount: overdue.reduce((s, i) => s + i.amount, 0) } : null;
    })
    .filter(Boolean);

  res.json(defaulters);
});

/* ============ SINGLE LOAN ============ */
router.get("/:id", protect(), async (req, res) => {
  const loan = await Loan.findById(req.params.id).populate("clientId", "fullName phone email");
  if (!loan) return res.status(404).json({ message: "Loan not found" });
  if (req.user.role === "client" && String(loan.clientId?._id) !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }
  res.json(loan);
});

/* ============ STAFF: REVIEW (RECOMMEND) A LOAN ============ */
router.post("/:id/staff-review", protect(["staff"]), async (req, res) => {
  const { decision, note } = req.body; // "approved" | "rejected"
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  loan.staffReview = { decision, note, reviewedAt: new Date(), reviewedBy: req.user.id };
  await loan.save();
  res.json(loan);
});

/* ============ ADMIN: FINAL DECISION ============ */
router.post("/:id/admin-decision", protect(["admin"]), async (req, res) => {
  const { decision, note } = req.body; // "approved" | "rejected"
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  loan.adminNote = note;
  loan.adminId = req.user.id;
  loan.approvedAt = new Date();

  if (decision === "approved") {
    loan.status = "active";

    await Payment.create({
      clientId: loan.clientId,
      clientName: loan.clientName,
      staffId: loan.staffId,
      loanId: loan._id,
      amount: loan.approvedAmount,
      method: "loan-disbursement",
      reference: `DISB-${loan._id}`,
    });
  } else {
    loan.status = "rejected";
  }

  await loan.save();
  res.json(loan);
});

/* ============ ADMIN: CREATE MANUAL LOAN (walk-in / offline client) ============ */
router.post("/manual", protect(["admin"]), async (req, res) => {
  const { clientName, phoneNumber, amount, durationInMonths, staffId } = req.body;

  const creditScore = 700; // manual loans are pre-vetted offline
  const offer = buildLoanOffer({ requestedAmount: Number(amount), durationInMonths, creditScore });

  const loan = await Loan.create({
    loanSource: "manual",
    clientName,
    phoneNumber,
    staffId: staffId || null,
    requestedAmount: Number(amount),
    approvedAmount: offer.approvedAmount,
    interestRate: offer.interestRate,
    totalInterest: offer.totalInterest,
    totalRepayment: offer.totalRepayment,
    durationInMonths: offer.durationInMonths,
    balance: offer.totalRepayment,
    creditScore,
    riskClass: "LOW",
    installments: offer.installments,
    dueDate: offer.dueDate,
    status: "active",
    adminId: req.user.id,
    approvedAt: new Date(),
  });

  res.status(201).json(loan);
});

/* ============ STAFF: COLLECT AN INSTALLMENT PAYMENT ============ */
router.post("/:id/pay", protect(["staff", "client"]), async (req, res) => {
  const { amount, method, installmentWeek } = req.body;
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  const installment = loan.installments.find((i) => i.week === Number(installmentWeek));
  if (installment) {
    installment.status = "paid";
    installment.paidAt = new Date();
  }

  loan.amountPaid = (loan.amountPaid || 0) + Number(amount);
  loan.balance = Math.max((loan.balance || loan.totalRepayment) - Number(amount), 0);
  if (loan.balance === 0) loan.status = "paid";

  await loan.save();

  const payment = await Payment.create({
    clientId: loan.clientId,
    clientName: loan.clientName,
    staffId: req.user.role === "staff" ? req.user.id : loan.staffId,
    loanId: loan._id,
    amount: Number(amount),
    method: method === "card" ? "card" : "loan-repayment",
    installmentWeek,
    reference: `REPAY-${loan._id}-W${installmentWeek}`,
  });

  res.json({ loan, payment });
});

module.exports = router;
