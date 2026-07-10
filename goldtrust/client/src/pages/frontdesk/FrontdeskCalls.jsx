import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge from "../../components/Badge";
import api from "../../api/client";
import { shortDate } from "../../utils/format";
import { frontdeskNav } from "./FrontdeskDashboard";

const OUTCOMES = ["answered", "no-answer", "promised-to-pay", "wrong-number"];

export default function FrontdeskCalls() {
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState("");
  const [matches, setMatches] = useState([]);
  const [client, setClient] = useState(null);
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState("answered");
  const [busy, setBusy] = useState(false);

  function load() {
    api.get("/frontdesk/calls/daily").then((res) => setLogs(res.data)).catch(() => {});
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
    try {
      await api.post("/frontdesk/calls", { clientId: client._id, note, outcome });
      setClient(null); setMatches([]); setQ(""); setNote("");
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout nav={frontdeskNav} roleLabel="Front desk">
      <PageHeader title="Call log" subtitle="Record every outbound call made today." />

      <div className="grid lg:grid-cols-2 gap-6">
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

          <div>
            <label className="label">Outcome</label>
            <select className="input" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
              {OUTCOMES.map((o) => <option key={o} value={o}>{o.replace("-", " ")}</option>)}
            </select>
          </div>
          <div><label className="label">Note</label><textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>

          <button className="btn-primary w-full" disabled={busy || !client}>{busy ? "Saving…" : "Log call"}</button>
        </form>

        <div>
          <h2 className="font-display text-lg text-ink mb-3">Today's calls</h2>
          <DataTable
            emptyLabel="No calls logged today."
            columns={[
              { key: "client", header: "Client", render: (r) => r.clientId?.fullName },
              { key: "outcome", header: "Outcome", render: (r) => <Badge tone="gold">{r.outcome?.replace("-", " ")}</Badge> },
              { key: "time", header: "Time", render: (r) => shortDate(r.createdAt) },
            ]}
            rows={logs}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
