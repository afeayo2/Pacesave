import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import api from "../../api/client";
import { staffNav } from "./StaffDashboard";

const empty = {
  fullName: "", phone: "", email: "", password: "",
  dateOfBirth: "", gender: "Male",
  savingsType: "Daily", targetAmount: "",
  street: "", city: "", state: "",
};

export default function StaffOnboard() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      await api.post("/clients", {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        address: { street: form.street, city: form.city, state: form.state },
        savings: { type: form.savingsType, targetAmount: Number(form.targetAmount) || 0, duration: "3 months", method: "Cash" },
      });
      setStatus("success");
      setForm(empty);
    } catch (err) {
      setStatus(err.response?.data?.message || "Could not onboard this client.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout nav={staffNav} roleLabel="Field staff">
      <PageHeader title="Onboard a client" subtitle="Register a new saver in the field. They'll appear on your client list immediately." />

      <form onSubmit={handleSubmit} className="card p-6 max-w-2xl space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Full name</label><input className="input" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></div>
          <div><label className="label">Phone</label><input className="input" required value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label className="label">Email</label><input type="email" className="input" required value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><label className="label">Temporary password</label><input type="text" className="input" required value={form.password} onChange={(e) => set("password", e.target.value)} /></div>
          <div><label className="label">Date of birth</label><input type="date" className="input" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="label">Street</label><input className="input" value={form.street} onChange={(e) => set("street", e.target.value)} /></div>
          <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
          <div><label className="label">State</label><input className="input" value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Savings rhythm</label>
            <select className="input" value={form.savingsType} onChange={(e) => set("savingsType", e.target.value)}>
              <option>Daily</option><option>Weekly</option><option>Monthly</option>
            </select>
          </div>
          <div><label className="label">Savings target (₦)</label><input type="number" className="input" value={form.targetAmount} onChange={(e) => set("targetAmount", e.target.value)} /></div>
        </div>

        {status === "success" && <p className="text-sm text-forest-700 bg-forest-50 rounded-lg px-3 py-2">Client onboarded successfully.</p>}
        {status && status !== "success" && <p className="text-sm text-rust bg-rust/10 rounded-lg px-3 py-2">{status}</p>}

        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Onboard client"}</button>
      </form>
    </DashboardLayout>
  );
}
