const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");
const Client = require("../models/Client");
const { protect } = require("../middleware/auth");

/* ============ STAFF: COLLECT A SAVINGS DEPOSIT (cash/card, field visit) ============ */
router.post("/collect", protect(["staff", "frontdesk"]), async (req, res) => {
  const { clientId, amount, method } = req.body;

  const client = await Client.findById(clientId);
  if (!client) return res.status(404).json({ message: "Client not found" });

  client.balance = (client.balance || 0) + Number(amount);
  await client.save();

  const payment = await Payment.create({
    clientId: client._id,
    clientName: client.fullName,
    staffId: req.user.role === "staff" ? req.user.id : null,
    amount: Number(amount),
    method: method === "card" ? "card" : "savings-deposit",
    reference: `DEP-${client._id}-${Date.now()}`,
  });

  res.status(201).json({ payment, newBalance: client.balance });
});

/* ============ ADMIN: ALL PAYMENTS ============ */
router.get("/", protect(["admin", "ict"]), async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 }).limit(300);
  res.json(payments);
});

/* ============ STAFF: MY COLLECTIONS SUMMARY ============ */
router.get("/collections-summary", protect(["staff", "admin"]), async (req, res) => {
  const staffId = req.user.role === "staff" ? req.user.id : req.query.staffId;
  if (!staffId) return res.status(400).json({ message: "staffId is required" });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [today, allTime] = await Promise.all([
    Payment.find({ staffId, createdAt: { $gte: startOfDay } }),
    Payment.find({ staffId }),
  ]);

  res.json({
    todayCount: today.length,
    todayTotal: today.reduce((s, p) => s + p.amount, 0),
    allTimeCount: allTime.length,
    allTimeTotal: allTime.reduce((s, p) => s + p.amount, 0),
  });
});

module.exports = router;
