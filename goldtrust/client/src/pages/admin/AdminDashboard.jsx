import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Landmark, Wallet, UserCog } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import api from "../../api/client";
import { naira } from "../../utils/format";

export const adminNav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/loans", label: "Loans", icon: Landmark },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { to: "/admin/staff", label: "Staff", icon: UserCog },
];

export default function AdminDashboard() {
  const [o, setO] = useState(null);

  useEffect(() => {
    api.get("/admin/overview").then((res) => setO(res.data)).catch(() => {});
  }, []);

  return (
    <DashboardLayout nav={adminNav} roleLabel="Admin">
      <PageHeader title="Business overview" subtitle="Portfolio health across every desk, live." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard label="Total clients" value={o?.totalClients ?? "—"} icon={Users} accent="forest" />
        <StatCard label="Active staff" value={o?.activeStaff ?? "—"} icon={UserCog} accent="gold" />
        <StatCard label="Active loans" value={o?.activeLoans ?? "—"} icon={Landmark} accent="forest" />
        <StatCard label="Pending loan requests" value={o?.pendingLoans ?? "—"} icon={Landmark} accent="gold" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total savings held" value={naira(o?.totalSavings)} icon={Wallet} accent="forest" />
        <StatCard label="Total collected" value={naira(o?.totalCollected)} icon={Wallet} accent="gold" />
        <StatCard label="Total disbursed" value={naira(o?.totalDisbursed)} icon={Landmark} accent="forest" />
        <StatCard label="Outstanding loan balance" value={naira(o?.totalOutstanding)} icon={Landmark} accent="gold" hint={`${o?.pendingWithdrawals ?? 0} withdrawals pending`} />
      </div>
    </DashboardLayout>
  );
}
