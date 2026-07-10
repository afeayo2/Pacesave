require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/clients", require("./routes/client.routes"));
app.use("/api/loans", require("./routes/loan.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/withdrawals", require("./routes/withdrawal.routes"));
app.use("/api/staff", require("./routes/staff.routes"));
app.use("/api/frontdesk", require("./routes/frontdesk.routes"));
app.use("/api/ict", require("./routes/ict.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// Serve the built React app in production (after `npm run build` in /client)
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.use((req, res) => res.status(404).json({ message: "Not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 GoldTrust API running on port ${PORT}`));
