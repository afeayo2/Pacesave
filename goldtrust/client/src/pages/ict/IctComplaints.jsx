import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import api from "../../api/client";
import { shortDate } from "../../utils/format";
import { ictNav } from "./IctDashboard";

export default function IctComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("open");

  function load() {
    api.get("/ict/complaints", { params: filter ? { status: filter } : {} }).then((res) => setComplaints(res.data)).catch(() => {});
  }
  useEffect(load, [filter]);

  async function resolve(id) {
    await api.patch(`/ict/complaints/${id}/resolve`);
    load();
  }

  return (
    <DashboardLayout nav={ictNav} roleLabel="ICT">
      <PageHeader
        title="Complaints"
        subtitle="Client issues raised by the front desk."
        action={
          <div className="flex gap-1.5 p-1 bg-forest-50 rounded-full">
            {["open", "resolved", ""].map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${filter === s ? "bg-white text-forest-700 shadow-sm" : "text-ink/45"}`}>
                {s || "All"}
              </button>
            ))}
          </div>
        }
      />
      <DataTable
        emptyLabel="No complaints to show."
        columns={[
          { key: "client", header: "Client", render: (r) => r.clientId?.fullName },
          { key: "title", header: "Title" },
          { key: "description", header: "Description" },
          { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "date", header: "Logged", render: (r) => shortDate(r.createdAt) },
          { key: "action", header: "", render: (r) => r.status === "open" && (
            <button className="text-forest-600 font-semibold text-xs" onClick={() => resolve(r._id)}>Mark resolved</button>
          ) },
        ]}
        rows={complaints}
      />
    </DashboardLayout>
  );
}
