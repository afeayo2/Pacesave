import { useEffect, useState } from "react";
import { LayoutDashboard, Search, MessageSquareWarning, PhoneCall } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";

export const frontdeskNav = [
  { to: "/frontdesk", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/frontdesk/search", label: "Find a client", icon: Search },
  { to: "/frontdesk/complaints", label: "Complaints", icon: MessageSquareWarning },
  { to: "/frontdesk/calls", label: "Call log", icon: PhoneCall },
];

export default function FrontdeskDashboard() {
  const [disbursements, setDisbursements] = useState([]);
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    api.get("/frontdesk/disbursements").then((res) => setDisbursements(res.data)).catch(() => {});
    api.get("/frontdesk/calls/daily").then((res) => setCalls(res.data)).catch(() => {});
  }, []);

  return (
    <DashboardLayout nav={frontdeskNav} roleLabel="Front desk">
      <PageHeader title="Front desk" subtitle="Client support, disbursement tracking and call logs." />
      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        <StatCard label="Loans awaiting disbursement" value={disbursements.length} icon={LayoutDashboard} accent="gold" />
        <StatCard label="Calls logged today" value={calls.length} icon={PhoneCall} accent="forest" />
      </div>

      <h2 className="font-display text-lg text-ink mb-3">Active loans</h2>
      <DataTable
        emptyLabel="No active loans right now."
        columns={[
          { key: "client", header: "Client", render: (r) => r.clientId?.fullName },
          { key: "phone", header: "Phone", render: (r) => r.clientId?.phone },
          { key: "amount", header: "Amount", render: (r) => naira(r.approvedAmount) },
          { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "date", header: "Approved", render: (r) => shortDate(r.approvedAt) },
        ]}
        rows={disbursements}
      />
    </DashboardLayout>
  );
}
