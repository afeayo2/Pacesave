import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";
import { adminNav } from "./AdminDashboard";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");

  function load() {
    api.get("/clients", { params: q ? { q } : {} }).then((res) => setClients(res.data)).catch(() => {});
  }
  useEffect(load, [q]);

  return (
    <DashboardLayout nav={adminNav} roleLabel="Admin">
      <PageHeader
        title="Clients"
        subtitle="Every saver on the platform."
        action={<input className="input max-w-xs" placeholder="Search name or phone" value={q} onChange={(e) => setQ(e.target.value)} />}
      />
      <DataTable
        emptyLabel="No clients found."
        columns={[
          { key: "fullName", header: "Name" },
          { key: "phone", header: "Phone" },
          { key: "balance", header: "Savings", render: (r) => naira(r.balance) },
          { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "since", header: "Onboarded", render: (r) => shortDate(r.onboardedAt) },
        ]}
        rows={clients}
      />
    </DashboardLayout>
  );
}
