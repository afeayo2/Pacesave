require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const Client = require("../models/Client");
const Staff = require("../models/Staff");
const FrontDesk = require("../models/FrontDesk");
const ICTStaff = require("../models/ICTStaff");
const Admin = require("../models/Admin");

async function seed() {
  await connectDB();

  await Promise.all([
    Client.deleteMany({}),
    Staff.deleteMany({}),
    FrontDesk.deleteMany({}),
    ICTStaff.deleteMany({}),
    Admin.deleteMany({}),
  ]);

  const admin = await Admin.create({
    fullName: "Ada Okafor",
    email: "admin@goldtrust.com",
    password: "password123",
  });

  const staff = await Staff.create({
    fullName: "Chinedu Umeh",
    phone: "08010000001",
    email: "staff@goldtrust.com",
    password: "password123",
  });

  await FrontDesk.create({
    fullName: "Blessing Eze",
    email: "frontdesk@goldtrust.com",
    phone: "08010000002",
    password: "password123",
  });

  await ICTStaff.create({
    fullName: "Tunde Bakare",
    email: "ict@goldtrust.com",
    password: "password123",
  });

  await Client.create({
    fullName: "Ngozi Adeyemi",
    phone: "08030000003",
    email: "client@goldtrust.com",
    password: "password123",
    balance: 45000,
    staffId: staff._id,
    onboardedBy: staff._id,
    savings: { type: "Daily", targetAmount: 200000, duration: "6 months", method: "Cash" },
    address: { street: "12 Allen Avenue", city: "Ikeja", state: "Lagos" },
  });

  console.log("✅ Seed complete. Demo logins (all passwords: password123):");
  console.log("   admin      → admin@goldtrust.com");
  console.log("   staff      → staff@goldtrust.com");
  console.log("   frontdesk  → frontdesk@goldtrust.com");
  console.log("   ict        → ict@goldtrust.com");
  console.log("   client     → client@goldtrust.com / 08030000003");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
