import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import Modal from "../../components/Modal";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";
import { adminNav } from "./AdminDashboard";

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  function load() {
    api.get("/staff").then((res) => setStaff(res.data)).catch(() => {});
    api.get("/staff/analytics/overview").then((res) => setAnalytics(res.data)).catch(() => {});
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/register/staff", form);
      setOpen(false);
      setForm({ fullName: "", phone: "", email: "", password: "" });
      load();
    } finally {
      setBusy(false);
    }
  }

  async function deactivate(id) {
    await api.delete(`/staff/${id}`);
    load();
  }

  return (
    <DashboardLayout nav={adminNav} roleLabel="Admin">
      <PageHeader
        title="Staff"
        subtitle="Field officers and their collection performance."
        action={<button className="btn-primary" onClick={() => setOpen(true)}>Add staff</button>}
      />

      <h2 className="font-display text-lg text-ink mb-3">Performance leaderboard</h2>
      <DataTable
        emptyLabel="No collection activity yet."
        columns={[
          { key: "fullName", header: "Name" },
          { key: "clientsManaged", header: "Clients" },
          { key: "activeLoans", header: "Active loans" },
          { key: "totalCollected", header: "Total collected", render: (r) => naira(r.totalCollected) },
        ]}
        rows={analytics}
      />

      <h2 className="font-display text-lg text-ink mb-3 mt-8">All staff accounts</h2>
      <DataTable
        emptyLabel="No staff accounts yet."
        columns={[
          { key: "fullName", header: "Name" },
          { key: "phone", header: "Phone" },
          { key: "email", header: "Email" },
          { key: "isActive", header: "Status", render: (r) => <Badge tone={statusTone(r.isActive ? "active" : "inactive")}>{r.isActive ? "active" : "inactive"}</Badge> },
          { key: "since", header: "Joined", render: (r) => shortDate(r.createdAt) },
          { key: "action", header: "", render: (r) => r.isActive && (
            <button className="text-rust font-semibold text-xs" onClick={() => deactivate(r._id)}>Deactivate</button>
          ) },
        ]}
        rows={staff}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add a staff account">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Full name</label><input className="input" required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} /></div>
          <div><label className="label">Phone</label><input className="input" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Temporary password</label><input className="input" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating…" : "Create staff account"}</button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
