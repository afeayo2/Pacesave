import { useEffect, useState } from "react";
import { LayoutDashboard, Users, UserPlus, Wallet, Landmark } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import api from "../../api/client";
import { naira } from "../../utils/format";

export const staffNav = [
  { to: "/staff", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/staff/clients", label: "My clients", icon: Users },
  { to: "/staff/onboard", label: "Onboard client", icon: UserPlus },
  { to: "/staff/collect", label: "Collect payment", icon: Wallet },
  { to: "/staff/loans", label: "Loan reviews", icon: Landmark },
];

export default function StaffDashboard() {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    api.get("/staff/me/daily-activity").then((res) => setActivity(res.data)).catch(() => {});
  }, []);

  return (
    <DashboardLayout nav={staffNav} roleLabel="Field staff">
      <PageHeader title="Today's activity" subtitle="Your collections, onboarding and reviews so far today." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Collected today" value={naira(activity?.collectionsTotal)} hint={`${activity?.collectionsCount || 0} payments`} icon={Wallet} accent="forest" />
        <StatCard label="Clients onboarded" value={activity?.clientsOnboardedToday ?? "—"} icon={UserPlus} accent="gold" />
        <StatCard label="Loans reviewed" value={activity?.loansReviewedToday ?? "—"} icon={Landmark} accent="forest" />
        <StatCard label="Assigned clients" value="See list" hint="Open 'My clients'" icon={Users} accent="gold" />
      </div>
    </DashboardLayout>
  );
}
