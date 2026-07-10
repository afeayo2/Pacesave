import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import Modal from "../../components/Modal";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";
import { clientNav } from "./ClientDashboard";

export default function ClientLoans() {
  const [loans, setLoans] = useState([]);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState(3);
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    api.get("/loans/mine").then((res) => setLoans(res.data)).catch(() => {});
  }

  useEffect(load, []);

  async function handlePreview(e) {
    e.preventDefault();
    setError("");
    setOffer(null);
    setBusy(true);
    try {
      const { data } = await api.post("/loans/preview", { amount, durationInMonths: months });
      setOffer(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not calculate an offer.");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    setBusy(true);
    try {
      await api.post("/loans/confirm", { amount, durationInMonths: months });
      setOpen(false);
      setOffer(null);
      setAmount("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your loan request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout nav={clientNav} roleLabel="Client">
      <PageHeader
        title="Loans"
        subtitle="Request a loan based on your savings history."
        action={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            Request a loan
          </button>
        }
      />

      <DataTable
        emptyLabel="You haven't requested a loan yet."
        columns={[
          { key: "date", header: "Requested", render: (r) => shortDate(r.createdAt) },
          { key: "amount", header: "Amount", render: (r) => naira(r.approvedAmount || r.requestedAmount) },
          { key: "repay", header: "Total repayment", render: (r) => naira(r.totalRepayment) },
          { key: "balance", header: "Balance", render: (r) => naira(r.balance) },
          { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
        ]}
        rows={loans}
      />

      <Modal open={open} onClose={() => { setOpen(false); setOffer(null); setError(""); }} title="Request a loan" wide>
        {!offer ? (
          <form onSubmit={handlePreview} className="space-y-4">
            <div>
              <label className="label">Amount (₦)</label>
              <input type="number" min="1000" className="input" required value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="label">Duration</label>
              <select className="input" value={months} onChange={(e) => setMonths(e.target.value)}>
                <option value={3}>3 months</option>
                <option value={4}>4 months</option>
                <option value={5}>5 months</option>
                <option value={6}>6 months</option>
              </select>
            </div>
            {error && <p className="text-sm text-rust bg-rust/10 rounded-lg px-3 py-2">{error}</p>}
            <button className="btn-primary w-full" disabled={busy}>{busy ? "Checking eligibility…" : "See my offer"}</button>
          </form>
        ) : offer.eligible ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-ink/40 text-xs uppercase">Approved amount</p><p className="font-mono font-semibold">{naira(offer.approvedAmount)}</p></div>
              <div><p className="text-ink/40 text-xs uppercase">Total repayment</p><p className="font-mono font-semibold">{naira(offer.totalRepayment)}</p></div>
              <div><p className="text-ink/40 text-xs uppercase">Weekly installment</p><p className="font-mono font-semibold">{naira(offer.weeklyInstallment)}</p></div>
              <div><p className="text-ink/40 text-xs uppercase">Credit score</p><p className="font-mono font-semibold">{offer.creditScore} · {offer.riskClass}</p></div>
            </div>
            <div className="max-h-48 overflow-y-auto border border-forest-100 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-forest-50 sticky top-0"><tr><th className="text-left px-3 py-2">Week</th><th className="text-left px-3 py-2">Due</th><th className="text-left px-3 py-2">Amount</th></tr></thead>
                <tbody>
                  {offer.installments.map((i) => (
                    <tr key={i.week} className="border-t border-forest-100">
                      <td className="px-3 py-1.5">{i.week}</td>
                      <td className="px-3 py-1.5">{shortDate(i.dueDate)}</td>
                      <td className="px-3 py-1.5 font-mono">{naira(i.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {error && <p className="text-sm text-rust bg-rust/10 rounded-lg px-3 py-2">{error}</p>}
            <button className="btn-primary w-full" disabled={busy} onClick={handleConfirm}>
              {busy ? "Submitting…" : "Confirm & submit for review"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-ink/60">{offer.message}</p>
        )}
      </Modal>
    </DashboardLayout>
  );
}
