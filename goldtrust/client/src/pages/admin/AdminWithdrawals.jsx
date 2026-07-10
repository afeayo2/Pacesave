import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";
import { adminNav } from "./AdminDashboard";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [busy, setBusy] = useState("");

  function load() {
    api.get("/withdrawals", { params: statusFilter ? { status: statusFilter } : {} }).then((res) => setWithdrawals(res.data)).catch(() => {});
  }
  useEffect(load, [statusFilter]);

  async function approve(id) {
    setBusy(id);
    try { await api.post(`/withdrawals/${id}/approve`); load(); } finally { setBusy(""); }
  }
  async function reject(id) {
    setBusy(id);
    try { await api.post(`/withdrawals/${id}/reject`, { note: "Rejected by admin" }); load(); } finally { setBusy(""); }
  }

  return (
    <DashboardLayout nav={adminNav} roleLabel="Admin">
      <PageHeader title="Withdrawal requests" subtitle="Client requests to withdraw from their savings." />

      <div className="flex gap-1.5 p-1 bg-forest-50 rounded-full w-fit mb-5">
        {["pending", "approved", "rejected", ""].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusFilter === s ? "bg-white text-forest-700 shadow-sm" : "text-ink/45"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <DataTable
        emptyLabel="No withdrawal requests in this category."
        columns={[
          { key: "client", header: "Client", render: (r) => r.clientId?.fullName },
          { key: "amount", header: "Amount", render: (r) => naira(r.amount) },
          { key: "bank", header: "Bank details", render: (r) => `${r.bankName || "—"} · ${r.accountNumber || "—"}` },
          { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "date", header: "Requested", render: (r) => shortDate(r.createdAt) },
          { key: "action", header: "", render: (r) => r.status === "pending" && (
            <div className="flex gap-2">
              <button disabled={busy === r._id} className="text-forest-600 font-semibold text-xs" onClick={() => approve(r._id)}>Approve</button>
              <button disabled={busy === r._id} className="text-rust font-semibold text-xs" onClick={() => reject(r._id)}>Reject</button>
            </div>
          ) },
        ]}
        rows={withdrawals}
      />
    </DashboardLayout>
  );
}
