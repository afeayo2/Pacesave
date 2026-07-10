const express = require("express");
const router = express.Router();

const Client = require("../models/Client");
const Loan = require("../models/Loan");
const Complaint = require("../models/Complaint");
const CallLog = require("../models/CallLog");
const { protect } = require("../middleware/auth");

/* ============ CLIENTS AWAITING PHYSICAL DISBURSEMENT ============ */
router.get("/disbursements", protect(["frontdesk"]), async (req, res) => {
  const loans = await Loan.find({ status: "active" }).populate("clientId", "fullName phone").sort({ approvedAt: -1 }).limit(100);
  res.json(loans);
});

/* ============ COMPLAINTS ============ */
router.post("/complaints", protect(["frontdesk"]), async (req, res) => {
  const { clientId, title, description } = req.body;
  const complaint = await Complaint.create({ clientId, staffId: req.user.id, title, description });
  res.status(201).json(complaint);
});

router.get("/complaints", protect(["frontdesk"]), async (req, res) => {
  const complaints = await Complaint.find({ staffId: req.user.id }).populate("clientId", "fullName phone").sort({ createdAt: -1 });
  res.json(complaints);
});

/* ============ CALL LOGS ============ */
router.post("/calls", protect(["frontdesk"]), async (req, res) => {
  const { clientId, loanId, note, outcome } = req.body;
  const log = await CallLog.create({ clientId, loanId, staffId: req.user.id, note, outcome });
  res.status(201).json(log);
});

router.get("/calls/daily", protect(["frontdesk"]), async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const logs = await CallLog.find({ staffId: req.user.id, createdAt: { $gte: startOfDay } })
    .populate("clientId", "fullName phone")
    .sort({ createdAt: -1 });
  res.json(logs);
});

/* ============ SEARCH CLIENTS ============ */
router.get("/clients/search", protect(["frontdesk"]), async (req, res) => {
  const { q } = req.query;
  const clients = await Client.find({
    $or: [{ fullName: new RegExp(q || "", "i") }, { phone: new RegExp(q || "", "i") }],
  })
    .select("-password")
    .limit(30);
  res.json(clients);
});

module.exports = router;
