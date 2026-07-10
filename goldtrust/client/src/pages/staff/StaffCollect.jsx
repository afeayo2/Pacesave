import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";
import { staffNav } from "./StaffDashboard";

export default function StaffCollect() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState([]);

  function loadRecent() {
    api.get("/payments/mine").then((res) => setRecent(res.data)).catch(() => {});
  }

  useEffect(() => {
    api.get("/staff/me/assigned-clients").then((res) => setClients(res.data)).catch(() => {});
    loadRecent();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      await api.post("/payments/collect", { clientId, amount: Number(amount), method });
      setStatus("success");
      setAmount("");
      loadRecent();
    } catch (err) {
      setStatus(err.response?.data?.message || "Could not record this payment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout nav={staffNav} roleLabel="Field staff">
      <PageHeader title="Collect a savings payment" subtitle="Record a cash or card deposit for one of your clients." />

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="card p-6 space-y-4 h-fit">
          <div>
            <label className="label">Client</label>
            <select className="input" required value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Select a client</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.fullName} — {c.phone}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Amount (₦)</label>
            <input type="number" min="100" className="input" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">Method</label>
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </div>
          {status === "success" && <p className="text-sm text-forest-700 bg-forest-50 rounded-lg px-3 py-2">Payment recorded.</p>}
          {status && status !== "success" && <p className="text-sm text-rust bg-rust/10 rounded-lg px-3 py-2">{status}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Recording…" : "Record payment"}</button>
        </form>

        <div>
          <h2 className="font-display text-lg text-ink mb-3">Your recent collections</h2>
          <DataTable
            emptyLabel="No collections recorded yet."
            columns={[
              { key: "date", header: "Date", render: (r) => shortDate(r.createdAt) },
              { key: "clientName", header: "Client" },
              { key: "amount", header: "Amount", render: (r) => naira(r.amount) },
              { key: "method", header: "Method" },
            ]}
            rows={recent}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
