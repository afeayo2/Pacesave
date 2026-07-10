import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";
import { staffNav } from "./StaffDashboard";

export default function StaffClients() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    api.get("/staff/me/assigned-clients").then((res) => setClients(res.data)).catch(() => {});
  }, []);

  return (
    <DashboardLayout nav={staffNav} roleLabel="Field staff">
      <PageHeader title="My clients" subtitle="Clients assigned to you for savings collection and support." />
      <DataTable
        emptyLabel="No clients assigned to you yet."
        columns={[
          { key: "fullName", header: "Name" },
          { key: "phone", header: "Phone" },
          { key: "balance", header: "Savings balance", render: (r) => naira(r.balance) },
          { key: "plan", header: "Plan", render: (r) => r.savings?.type || "—" },
          { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "since", header: "Since", render: (r) => shortDate(r.onboardedAt) },
        ]}
        rows={clients}
      />
    </DashboardLayout>
  );
}
