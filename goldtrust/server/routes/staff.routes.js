const express = require("express");
const router = express.Router();

const Staff = require("../models/Staff");
const Client = require("../models/Client");
const Payment = require("../models/Payment");
const Loan = require("../models/Loan");
const { protect } = require("../middleware/auth");

/* ============ ADMIN: LIST / REMOVE STAFF ============ */
router.get("/", protect(["admin", "ict"]), async (req, res) => {
  const staff = await Staff.find().select("-password").sort({ createdAt: -1 });
  res.json(staff);
});

router.delete("/:id", protect(["admin"]), async (req, res) => {
  await Staff.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: "Staff deactivated" });
});

/* ============ STAFF: MY ASSIGNED CLIENTS ============ */
router.get("/me/assigned-clients", protect(["staff"]), async (req, res) => {
  const clients = await Client.find({ staffId: req.user.id }).select("-password").sort({ createdAt: -1 });
  res.json(clients);
});

/* ============ STAFF: CLIENTS I ONBOARDED ============ */
router.get("/me/onboarded-clients", protect(["staff"]), async (req, res) => {
  const clients = await Client.find({ onboardedBy: req.user.id }).select("-password").sort({ createdAt: -1 });
  res.json(clients);
});

/* ============ STAFF: DAILY ACTIVITY ============ */
router.get("/me/daily-activity", protect(["staff"]), async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [collections, onboarded, loanReviews] = await Promise.all([
    Payment.find({ staffId: req.user.id, createdAt: { $gte: startOfDay } }),
    Client.countDocuments({ onboardedBy: req.user.id, createdAt: { $gte: startOfDay } }),
    Loan.countDocuments({ "staffReview.reviewedBy": req.user.id, "staffReview.reviewedAt": { $gte: startOfDay } }),
  ]);

  res.json({
    collectionsCount: collections.length,
    collectionsTotal: collections.reduce((s, p) => s + p.amount, 0),
    clientsOnboardedToday: onboarded,
    loansReviewedToday: loanReviews,
  });
});

/* ============ ADMIN: PER-STAFF REPORT ============ */
router.get("/:id/report", protect(["admin"]), async (req, res) => {
  const staffId = req.params.id;

  const [clients, loans, payments] = await Promise.all([
    Client.countDocuments({ staffId }),
    Loan.find({ staffId }),
    Payment.find({ staffId }),
  ]);

  res.json({
    clientsManaged: clients,
    activeLoans: loans.filter((l) => l.status === "active").length,
    totalDisbursed: loans.filter((l) => l.status !== "rejected" && l.status !== "pending").reduce((s, l) => s + (l.approvedAmount || 0), 0),
    totalCollected: payments.reduce((s, p) => s + p.amount, 0),
    collectionsCount: payments.length,
  });
});

/* ============ ADMIN: STAFF ANALYTICS (all staff, ranked) ============ */
router.get("/analytics/overview", protect(["admin"]), async (req, res) => {
  const staffList = await Staff.find().select("-password");

  const analytics = await Promise.all(
    staffList.map(async (s) => {
      const [clients, loans, payments] = await Promise.all([
        Client.countDocuments({ staffId: s._id }),
        Loan.find({ staffId: s._id }),
        Payment.find({ staffId: s._id }),
      ]);

      return {
        staffId: s._id,
        fullName: s.fullName,
        clientsManaged: clients,
        activeLoans: loans.filter((l) => l.status === "active").length,
        totalCollected: payments.reduce((sum, p) => sum + p.amount, 0),
      };
    })
  );

  analytics.sort((a, b) => b.totalCollected - a.totalCollected);
  res.json(analytics);
});

module.exports = router;
