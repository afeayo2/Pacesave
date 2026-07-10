const express = require("express");
const router = express.Router();

const Client = require("../models/Client");
const Staff = require("../models/Staff");
const FrontDesk = require("../models/FrontDesk");
const ICTStaff = require("../models/ICTStaff");
const Admin = require("../models/Admin");
const { signToken } = require("../utils/jwt");
const { protect } = require("../middleware/auth");

const MODELS = {
  client: Client,
  staff: Staff,
  frontdesk: FrontDesk,
  ict: ICTStaff,
  admin: Admin,
};

function modelFor(role) {
  return MODELS[role];
}

/* ============ REGISTER ============ */
router.post("/register/:role", async (req, res) => {
  try {
    const Model = modelFor(req.params.role);
    if (!Model) return res.status(400).json({ message: "Unknown role" });

    const body = { ...req.body };

    // Clients must provide savings preferences; default them if missing.
    if (req.params.role === "client" && !body.savings) {
      body.savings = { type: "Daily", targetAmount: 0, duration: "3 months", method: "Cash" };
    }

    const doc = await Model.create(body);
    const token = signToken({ id: doc._id, role: req.params.role });

    const safe = doc.toObject();
    delete safe.password;

    res.status(201).json({ token, role: req.params.role, user: safe });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "An account with those details already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

/* ============ LOGIN ============ */
// body: { role, identifier (email or phone), password }
router.post("/login", async (req, res) => {
  try {
    const { role, identifier, password } = req.body;
    const Model = modelFor(role);
    if (!Model) return res.status(400).json({ message: "Unknown role" });

    const query = { $or: [{ email: identifier }, { phone: identifier }] };
    const user = await Model.findOne(query);

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ id: user._id, role });
    const safe = user.toObject();
    delete safe.password;

    res.json({ token, role, user: safe });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

/* ============ ME ============ */
router.get("/me", protect(), async (req, res) => {
  try {
    const Model = modelFor(req.user.role);
    const user = await Model.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ role: req.user.role, user });
  } catch (err) {
    res.status(500).json({ message: "Could not load profile" });
  }
});

module.exports = router;
