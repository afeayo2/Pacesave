import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import Modal from "../../components/Modal";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";
import { staffNav } from "./StaffDashboard";

export default function StaffLoans() {
  const [loans, setLoans] = useState([]);
  const [active, setActive] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    api.get("/loans").then((res) => setLoans(res.data)).catch(() => {});
  }

  useEffect(load, []);

  async function review(decision) {
    setBusy(true);
    try {
      await api.post(`/loans/${active._id}/staff-review`, { decision, note });
      setActive(null);
      setNote("");
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout nav={staffNav} roleLabel="Field staff">
      <PageHeader title="Loan reviews" subtitle="Recommend approval or rejection before it goes to management." />
      <DataTable
        emptyLabel="No loan requests from your clients yet."
        columns={[
          { key: "client", header: "Client", render: (r) => r.clientName || r.clientId?.fullName },
          { key: "amount", header: "Requested", render: (r) => naira(r.requestedAmount) },
          { key: "score", header: "Credit score", render: (r) => `${r.creditScore} · ${r.riskClass}` },
          { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "review", header: "Your review", render: (r) => <Badge tone={statusTone(r.staffReview?.decision)}>{r.staffReview?.decision || "pending"}</Badge> },
          { key: "date", header: "Requested", render: (r) => shortDate(r.createdAt) },
          { key: "action", header: "", render: (r) => (
            <button className="text-forest-600 font-semibold text-xs" onClick={() => setActive(r)}>Review</button>
          ) },
        ]}
        rows={loans}
      />

      <Modal open={!!active} onClose={() => setActive(null)} title="Review loan request">
        {active && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-ink/40 text-xs uppercase">Client</p><p>{active.clientName || active.clientId?.fullName}</p></div>
              <div><p className="text-ink/40 text-xs uppercase">Requested</p><p className="font-mono">{naira(active.requestedAmount)}</p></div>
              <div><p className="text-ink/40 text-xs uppercase">Approved amount</p><p className="font-mono">{naira(active.approvedAmount)}</p></div>
              <div><p className="text-ink/40 text-xs uppercase">Credit score</p><p>{active.creditScore} · {active.riskClass}</p></div>
            </div>
            <div>
              <label className="label">Note</label>
              <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Field observations, verification notes…" />
            </div>
            <div className="flex gap-3">
              <button className="btn-primary flex-1" disabled={busy} onClick={() => review("approved")}>Recommend approve</button>
              <button className="btn-ghost flex-1" disabled={busy} onClick={() => review("rejected")}>Recommend reject</button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
