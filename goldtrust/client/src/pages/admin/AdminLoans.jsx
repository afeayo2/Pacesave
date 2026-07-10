import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import Modal from "../../components/Modal";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";
import { adminNav } from "./AdminDashboard";

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [active, setActive] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const [manualOpen, setManualOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [manual, setManual] = useState({ clientName: "", phoneNumber: "", amount: "", durationInMonths: 3, staffId: "" });

  function load() {
    api.get("/loans", { params: statusFilter ? { status: statusFilter } : {} }).then((res) => setLoans(res.data)).catch(() => {});
  }
  useEffect(load, [statusFilter]);
  useEffect(() => { api.get("/staff").then((res) => setStaffList(res.data)).catch(() => {}); }, []);

  async function decide(decision) {
    setBusy(true);
    try {
      await api.post(`/loans/${active._id}/admin-decision`, { decision, note });
      setActive(null);
      setNote("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function submitManual(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/loans/manual", manual);
      setManualOpen(false);
      setManual({ clientName: "", phoneNumber: "", amount: "", durationInMonths: 3, staffId: "" });
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout nav={adminNav} roleLabel="Admin">
      <PageHeader
        title="Loans"
        subtitle="Approve, reject or create loans directly."
        action={<button className="btn-primary" onClick={() => setManualOpen(true)}>New manual loan</button>}
      />

      <div className="flex gap-1.5 p-1 bg-forest-50 rounded-full w-fit mb-5">
        {["pending", "active", "rejected", "paid", ""].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusFilter === s ? "bg-white text-forest-700 shadow-sm" : "text-ink/45"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <DataTable
        emptyLabel="No loans in this category."
        columns={[
          { key: "client", header: "Client", render: (r) => r.clientName || r.clientId?.fullName },
          { key: "amount", header: "Approved", render: (r) => naira(r.approvedAmount) },
          { key: "repay", header: "Repayment", render: (r) => naira(r.totalRepayment) },
          { key: "staffReview", header: "Staff rec.", render: (r) => <Badge tone={statusTone(r.staffReview?.decision)}>{r.staffReview?.decision || "pending"}</Badge> },
          { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "date", header: "Requested", render: (r) => shortDate(r.createdAt) },
          { key: "action", header: "", render: (r) => r.status === "pending" && (
            <button className="text-forest-600 font-semibold text-xs" onClick={() => setActive(r)}>Decide</button>
          ) },
        ]}
        rows={loans}
      />

      <Modal open={!!active} onClose={() => setActive(null)} title="Final loan decision">
        {active && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-ink/40 text-xs uppercase">Client</p><p>{active.clientName || active.clientId?.fullName}</p></div>
              <div><p className="text-ink/40 text-xs uppercase">Approved amount</p><p className="font-mono">{naira(active.approvedAmount)}</p></div>
              <div><p className="text-ink/40 text-xs uppercase">Staff recommendation</p><p>{active.staffReview?.decision || "pending"}</p></div>
              <div><p className="text-ink/40 text-xs uppercase">Staff note</p><p>{active.staffReview?.note || "—"}</p></div>
            </div>
            <div><label className="label">Note</label><textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
            <div className="flex gap-3">
              <button className="btn-primary flex-1" disabled={busy} onClick={() => decide("approved")}>Approve & disburse</button>
              <button className="btn-ghost flex-1" disabled={busy} onClick={() => decide("rejected")}>Reject</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={manualOpen} onClose={() => setManualOpen(false)} title="Create manual loan">
        <form onSubmit={submitManual} className="space-y-4">
          <div><label className="label">Client name</label><input className="input" required value={manual.clientName} onChange={(e) => setManual((f) => ({ ...f, clientName: e.target.value }))} /></div>
          <div><label className="label">Phone</label><input className="input" required value={manual.phoneNumber} onChange={(e) => setManual((f) => ({ ...f, phoneNumber: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Amount (₦)</label><input type="number" className="input" required value={manual.amount} onChange={(e) => setManual((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div>
              <label className="label">Duration</label>
              <select className="input" value={manual.durationInMonths} onChange={(e) => setManual((f) => ({ ...f, durationInMonths: e.target.value }))}>
                <option value={3}>3 months</option><option value={4}>4 months</option><option value={5}>5 months</option><option value={6}>6 months</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Assign to staff (optional)</label>
            <select className="input" value={manual.staffId} onChange={(e) => setManual((f) => ({ ...f, staffId: e.target.value }))}>
              <option value="">Unassigned</option>
              {staffList.map((s) => <option key={s._id} value={s._id}>{s.fullName}</option>)}
            </select>
          </div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating…" : "Create & activate loan"}</button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
