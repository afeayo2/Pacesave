import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";
import { frontdeskNav } from "./FrontdeskDashboard";

export default function FrontdeskSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.get("/frontdesk/clients/search", { params: { q } });
      setResults(data);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout nav={frontdeskNav} roleLabel="Front desk">
      <PageHeader title="Find a client" subtitle="Search by name or phone number to pull up their account." />

      <form onSubmit={handleSearch} className="flex gap-3 mb-6 max-w-lg">
        <input className="input" placeholder="Name or phone number" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary shrink-0" disabled={busy}>{busy ? "Searching…" : "Search"}</button>
      </form>

      <DataTable
        emptyLabel="Search for a client to see their details here."
        columns={[
          { key: "fullName", header: "Name" },
          { key: "phone", header: "Phone" },
          { key: "email", header: "Email" },
          { key: "balance", header: "Savings", render: (r) => naira(r.balance) },
          { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "since", header: "Onboarded", render: (r) => shortDate(r.onboardedAt) },
        ]}
        rows={results}
      />
    </DashboardLayout>
  );
}
