import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";
import { clientNav } from "./ClientDashboard";

export default function ClientWithdraw() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    api.get("/clients/me/withdrawals").then((res) => setWithdrawals(res.data)).catch(() => {});
  }
  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      await api.post("/clients/me/withdraw", { amount: Number(amount), bankName, accountNumber });
      setAmount(""); setBankName(""); setAccountNumber("");
      setMsg("success:Withdrawal request submitted for review.");
      load();
    } catch (err) {
      setMsg(`error:${err.response?.data?.message || "Could not submit request."}`);
    } finally {
      setBusy(false);
    }
  }

  const [kind, text] = msg.includes(":") ? msg.split(":") : ["", msg];

  return (
    <DashboardLayout nav={clientNav} roleLabel="Client">
      <PageHeader title="Withdraw savings" subtitle="Requests are reviewed by an administrator before payout." />

      <div className="grid md:grid-cols-3 gap-6">
        <form onSubmit={submit} className="card p-6 space-y-4 md:col-span-1 h-fit">
          <div>
            <label className="label">Amount (₦)</label>
            <input type="number" min="500" className="input" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">Bank name</label>
            <input className="input" required value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </div>
          <div>
            <label className="label">Account number</label>
            <input className="input" required value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
          </div>
          {text && (
            <p className={`text-sm rounded-lg px-3 py-2 ${kind === "success" ? "text-forest-700 bg-forest-50" : "text-rust bg-rust/10"}`}>{text}</p>
          )}
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Submitting…" : "Request withdrawal"}</button>
        </form>

        <div className="md:col-span-2">
          <DataTable
            emptyLabel="No withdrawal requests yet."
            columns={[
              { key: "date", header: "Requested", render: (r) => shortDate(r.createdAt) },
              { key: "bank", header: "Bank", render: (r) => `${r.bankName} · ${r.accountNumber}` },
              { key: "amount", header: "Amount", render: (r) => naira(r.amount) },
              { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
            ]}
            rows={withdrawals}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
