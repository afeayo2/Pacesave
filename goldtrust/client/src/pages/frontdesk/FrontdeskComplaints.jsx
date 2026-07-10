import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import api from "../../api/client";
import { shortDate } from "../../utils/format";
import { frontdeskNav } from "./FrontdeskDashboard";

export default function FrontdeskComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [q, setQ] = useState("");
  const [matches, setMatches] = useState([]);
  const [client, setClient] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    api.get("/frontdesk/complaints").then((res) => setComplaints(res.data)).catch(() => {});
  }
  useEffect(load, []);

  async function search(e) {
    e.preventDefault();
    const { data } = await api.get("/frontdesk/clients/search", { params: { q } });
    setMatches(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      await api.post("/frontdesk/complaints", { clientId: client._id, title, description });
      setStatus("success");
      setTitle(""); setDescription(""); setClient(null); setMatches([]); setQ("");
      load();
    } catch (err) {
      setStatus(err.response?.data?.message || "Could not log this complaint.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout nav={frontdeskNav} roleLabel="Front desk">
      <PageHeader title="Complaints" subtitle="Log a client complaint for the IT desk to resolve." />

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {!client ? (
            <div>
              <label className="label">Find client</label>
              <div className="flex gap-2">
                <input className="input" placeholder="Name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
                <button type="button" className="btn-ghost shrink-0" onClick={search}>Search</button>
              </div>
              {matches.length > 0 && (
                <div className="mt-2 border border-forest-100 rounded-lg divide-y divide-forest-100">
                  {matches.map((m) => (
                    <button type="button" key={m._id} onClick={() => { setClient(m); setMatches([]); }} className="w-full text-left px-3 py-2 text-sm hover:bg-forest-50">
                      {m.fullName} — {m.phone}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-forest-50 rounded-lg px-3 py-2 text-sm">
              <span>{client.fullName} — {client.phone}</span>
              <button type="button" className="text-rust text-xs font-semibold" onClick={() => setClient(null)}>Change</button>
            </div>
          )}

          <div><label className="label">Title</label><input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} /></div>

          {status === "success" && <p className="text-sm text-forest-700 bg-forest-50 rounded-lg px-3 py-2">Complaint logged.</p>}
          {status && status !== "success" && <p className="text-sm text-rust bg-rust/10 rounded-lg px-3 py-2">{status}</p>}

          <button className="btn-primary w-full" disabled={busy || !client}>{busy ? "Logging…" : "Log complaint"}</button>
        </form>

        <div>
          <h2 className="font-display text-lg text-ink mb-3">Your logged complaints</h2>
          <DataTable
            emptyLabel="No complaints logged yet."
            columns={[
              { key: "client", header: "Client", render: (r) => r.clientId?.fullName },
              { key: "title", header: "Title" },
              { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
              { key: "date", header: "Logged", render: (r) => shortDate(r.createdAt) },
            ]}
            rows={complaints}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
