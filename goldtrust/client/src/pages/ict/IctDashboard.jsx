import { useEffect, useState } from "react";
import { LayoutDashboard, Users, HardDrive, MessageSquareWarning, Activity } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import api from "../../api/client";

export const ictNav = [
  { to: "/ict", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/ict/staff", label: "Staff accounts", icon: Users },
  { to: "/ict/inventory", label: "Inventory", icon: HardDrive },
  { to: "/ict/complaints", label: "Complaints", icon: MessageSquareWarning },
];

export default function IctDashboard() {
  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.get("/ict/dashboard").then((res) => setSummary(res.data)).catch(() => {});
    api.get("/ict/system-health").then((res) => setHealth(res.data)).catch(() => {});
  }, []);

  return (
    <DashboardLayout nav={ictNav} roleLabel="ICT">
      <PageHeader title="System overview" subtitle="Platform health, accounts and assets at a glance." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total clients" value={summary?.clients ?? "—"} icon={Users} accent="forest" />
        <StatCard label="Active staff" value={summary?.staff ?? "—"} icon={Users} accent="gold" />
        <StatCard label="Active loans" value={summary?.activeLoans ?? "—"} icon={Activity} accent="forest" />
        <StatCard label="Open complaints" value={summary?.openComplaints ?? "—"} icon={MessageSquareWarning} accent="gold" />
      </div>

      <div className="card p-6 flex items-center justify-between max-w-xl">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/45 mb-1">API status</p>
          <p className="font-semibold text-forest-700">{health?.apiStatus || "checking…"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/45 mb-1">Database</p>
          <p className={`font-semibold ${health?.dbStatus === "connected" ? "text-forest-700" : "text-rust"}`}>{health?.dbStatus || "checking…"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/45 mb-1">Uptime</p>
          <p className="font-mono font-semibold text-ink">{health ? `${Math.floor(health.uptimeSeconds / 60)}m` : "—"}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
