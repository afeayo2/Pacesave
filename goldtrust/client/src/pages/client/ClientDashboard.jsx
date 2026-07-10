import { useEffect, useState } from "react";
import { LayoutDashboard, PiggyBank, Landmark, Wallet, User } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import SavingsRing from "../../components/SavingsRing";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";

export const clientNav = [
  { to: "/client", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/client/loans", label: "Loans", icon: Landmark },
  { to: "/client/savings", label: "Savings & payments", icon: PiggyBank },
  { to: "/client/withdraw", label: "Withdraw", icon: Wallet },
  { to: "/client/profile", label: "Profile", icon: User },
];

export default function ClientDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/clients/me/dashboard").then((res) => setData(res.data)).catch(() => {});
  }, []);

  const client = data?.client;
  const loan = data?.activeLoan;

  return (
    <DashboardLayout nav={clientNav} roleLabel="Client">
      <PageHeader title={`Hi, ${client?.fullName?.split(" ")[0] || "there"}`} subtitle="Here's how your savings and loan are doing." />

      <div className="grid md:grid-cols-3 gap-5 mb-6">
        <div className="card p-6 flex items-center gap-6 md:col-span-1">
          <SavingsRing value={client?.balance || 0} target={client?.savings?.targetAmount || 1} />
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40">Balance</p>
            <p className="stat-num text-xl text-forest-700">{naira(client?.balance)}</p>
            <p className="text-xs uppercase tracking-wide text-ink/40 mt-3">Goal</p>
            <p className="stat-num text-sm text-ink/70">{naira(client?.savings?.targetAmount)}</p>
          </div>
        </div>

        <div className="md:col-span-2 grid sm:grid-cols-2 gap-5">
          <StatCard label="Savings rhythm" value={client?.savings?.type || "—"} icon={PiggyBank} accent="gold" />
          <StatCard
            label="Active loan"
            value={loan ? naira(loan.balance) : "None"}
            hint={loan ? `Status: ${loan.status}` : "Apply anytime"}
            icon={Landmark}
          />
        </div>
      </div>

      <h2 className="font-display text-lg text-ink mb-3">Recent activity</h2>
      <DataTable
        emptyLabel="No transactions yet — your deposits and repayments will show up here."
        columns={[
          { key: "date", header: "Date", render: (r) => shortDate(r.createdAt) },
          { key: "method", header: "Type", render: (r) => <Badge tone="green">{r.method.replace("-", " ")}</Badge> },
          { key: "amount", header: "Amount", render: (r) => naira(r.amount) },
        ]}
        rows={data?.recentPayments}
      />
    </DashboardLayout>
  );
}
