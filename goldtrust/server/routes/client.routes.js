const express = require("express");
const router = express.Router();

const Client = require("../models/Client");
const Loan = require("../models/Loan");
const Payment = require("../models/Payment");
const Withdrawal = require("../models/Withdrawal");
const { protect } = require("../middleware/auth");

/* ============ LIST / SEARCH (staff, admin, frontdesk, ict) ============ */
router.get("/", protect(["staff", "admin", "frontdesk", "ict"]), async (req, res) => {
  const { q, staffId } = req.query;
  const filter = {};
  if (staffId) filter.staffId = staffId;
  if (q) {
    filter.$or = [
      { fullName: new RegExp(q, "i") },
      { phone: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
    ];
  }
  const clients = await Client.find(filter).select("-password").sort({ createdAt: -1 }).limit(200);
  res.json(clients);
});

/* ============ MY DASHBOARD (client) ============ */
router.get("/me/dashboard", protect(["client"]), async (req, res) => {
  const client = await Client.findById(req.user.id).select("-password");
  if (!client) return res.status(404).json({ message: "Client not found" });

  const activeLoan = await Loan.findOne({
    clientId: client._id,
    status: { $in: ["pending", "approved", "active"] },
  }).sort({ createdAt: -1 });

  const recentPayments = await Payment.find({ clientId: client._id }).sort({ createdAt: -1 }).limit(10);

  res.json({ client, activeLoan, recentPayments });
});

/* ============ SINGLE CLIENT (staff/admin/frontdesk/ict/self) ============ */
router.get("/:id", protect(), async (req, res) => {
  if (req.user.role === "client" && req.user.id !== req.params.id) {
    return res.status(403).json({ message: "Not authorized" });
  }
  const client = await Client.findById(req.params.id).select("-password");
  if (!client) return res.status(404).json({ message: "Client not found" });
  res.json(client);
});

/* ============ STAFF/ADMIN: ONBOARD A NEW CLIENT ============ */
router.post("/", protect(["staff", "admin", "frontdesk"]), async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.savings) {
      body.savings = { type: "Daily", targetAmount: 0, duration: "3 months", method: "Cash" };
    }
    if (req.user.role === "staff") {
      body.onboardedBy = req.user.id;
      body.staffId = req.user.id;
    }
    const client = await Client.create(body);
    const safe = client.toObject();
    delete safe.password;
    res.status(201).json(safe);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A client with that phone number already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

/* ============ ADMIN: ASSIGN STAFF TO CLIENT ============ */
router.patch("/:id/assign", protect(["admin"]), async (req, res) => {
  const { staffId } = req.body;
  const client = await Client.findByIdAndUpdate(
    req.params.id,
    { staffId },
    { new: true }
  ).select("-password");
  res.json(client);
});

/* ============ CLIENT: REQUEST WITHDRAWAL ============ */
router.post("/me/withdraw", protect(["client"]), async (req, res) => {
  const { amount, bankName, accountNumber } = req.body;
  const client = await Client.findById(req.user.id);

  if (!client) return res.status(404).json({ message: "Client not found" });
  if (amount > client.balance) {
    return res.status(400).json({ message: "Insufficient savings balance" });
  }

  const withdrawal = await Withdrawal.create({
    clientId: client._id,
    amount,
    bankName,
    accountNumber,
  });

  res.status(201).json(withdrawal);
});

router.get("/me/withdrawals", protect(["client"]), async (req, res) => {
  const withdrawals = await Withdrawal.find({ clientId: req.user.id }).sort({ createdAt: -1 });
  res.json(withdrawals);
});

router.get("/me/payments", protect(["client"]), async (req, res) => {
  const payments = await Payment.find({ clientId: req.user.id }).sort({ createdAt: -1 });
  res.json(payments);
});

/* ============ CLIENT: UPDATE PROFILE ============ */
router.put("/me/profile", protect(["client"]), async (req, res) => {
  const disallowed = ["password", "balance", "staffId", "_id"];
  const updates = { ...req.body };
  disallowed.forEach((f) => delete updates[f]);

  const client = await Client.findByIdAndUpdate(req.user.id, updates, { new: true }).select(
    "-password"
  );
  res.json(client);
});

module.exports = router;
