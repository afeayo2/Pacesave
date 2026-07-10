import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import { shortDate } from "../../utils/format";
import api from "../../api/client";
import { ictNav } from "./IctDashboard";

export default function IctStaff() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    api.get("/staff").then((res) => setStaff(res.data)).catch(() => {});
  }, []);

  return (
    <DashboardLayout nav={ictNav} roleLabel="ICT">
      <PageHeader title="Staff accounts" subtitle="Every field staff account on the platform." />
      <DataTable
        emptyLabel="No staff accounts yet."
        columns={[
          { key: "fullName", header: "Name" },
          { key: "phone", header: "Phone" },
          { key: "email", header: "Email" },
          { key: "isActive", header: "Status", render: (r) => <Badge tone={statusTone(r.isActive ? "active" : "inactive")}>{r.isActive ? "active" : "inactive"}</Badge> },
          { key: "since", header: "Joined", render: (r) => shortDate(r.createdAt) },
        ]}
        rows={staff}
      />
    </DashboardLayout>
  );
}
