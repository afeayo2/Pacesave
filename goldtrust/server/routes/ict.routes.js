const express = require("express");
const router = express.Router();

const Client = require("../models/Client");
const Staff = require("../models/Staff");
const Loan = require("../models/Loan");
const Complaint = require("../models/Complaint");
const Inventory = require("../models/Inventory");
const { protect } = require("../middleware/auth");

/* ============ DASHBOARD SUMMARY ============ */
router.get("/dashboard", protect(["ict"]), async (req, res) => {
  const [clients, staff, loans, openComplaints, assets] = await Promise.all([
    Client.countDocuments(),
    Staff.countDocuments({ isActive: true }),
    Loan.countDocuments({ status: "active" }),
    Complaint.countDocuments({ status: "open" }),
    Inventory.countDocuments(),
  ]);
  res.json({ clients, staff, activeLoans: loans, openComplaints, assets });
});

/* ============ SYSTEM HEALTH (basic self-report) ============ */
router.get("/system-health", protect(["ict"]), async (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    apiStatus: "online",
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date(),
  });
});

/* ============ INVENTORY ============ */
router.get("/inventory", protect(["ict"]), async (req, res) => {
  const items = await Inventory.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post("/inventory", protect(["ict"]), async (req, res) => {
  const item = await Inventory.create(req.body);
  res.status(201).json(item);
});

router.post("/inventory/:id/assign", protect(["ict"]), async (req, res) => {
  const { assignedToType, assignedToId } = req.body;
  const item = await Inventory.findByIdAndUpdate(
    req.params.id,
    { assignedToType, assignedToId, assignedAt: new Date() },
    { new: true }
  );
  res.json(item);
});

/* ============ COMPLAINTS ============ */
router.get("/complaints", protect(["ict"]), async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const complaints = await Complaint.find(filter).populate("clientId", "fullName phone").sort({ createdAt: -1 });
  res.json(complaints);
});

router.patch("/complaints/:id/resolve", protect(["ict"]), async (req, res) => {
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status: "resolved", resolvedBy: req.user.id, resolvedAt: new Date() },
    { new: true }
  );
  res.json(complaint);
});

module.exports = router;
