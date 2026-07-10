const express = require("express");
const router = express.Router();

const Withdrawal = require("../models/Withdrawal");
const Client = require("../models/Client");
const { protect } = require("../middleware/auth");

router.get("/", protect(["admin"]), async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const withdrawals = await Withdrawal.find(filter)
    .populate("clientId", "fullName phone balance")
    .sort({ createdAt: -1 });
  res.json(withdrawals);
});

router.post("/:id/approve", protect(["admin"]), async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
  if (withdrawal.status !== "pending") {
    return res.status(400).json({ message: "Withdrawal already reviewed" });
  }

  const client = await Client.findById(withdrawal.clientId);
  if (!client || client.balance < withdrawal.amount) {
    return res.status(400).json({ message: "Client has insufficient balance" });
  }

  client.balance -= withdrawal.amount;
  await client.save();

  withdrawal.status = "approved";
  withdrawal.reviewedBy = req.user.id;
  withdrawal.reviewedAt = new Date();
  await withdrawal.save();

  res.json(withdrawal);
});

router.post("/:id/reject", protect(["admin"]), async (req, res) => {
  const { note } = req.body;
  const withdrawal = await Withdrawal.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", note, reviewedBy: req.user.id, reviewedAt: new Date() },
    { new: true }
  );
  res.json(withdrawal);
});

module.exports = router;
