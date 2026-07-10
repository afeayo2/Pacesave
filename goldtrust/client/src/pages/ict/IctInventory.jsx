import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge, { statusTone } from "../../components/Badge";
import Modal from "../../components/Modal";
import api from "../../api/client";
import { ictNav } from "./IctDashboard";

const empty = { assetType: "phone", brand: "", model: "", serialNumber: "", imei: "", simNumber: "", network: "" };

export default function IctInventory() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  function load() {
    api.get("/ict/inventory").then((res) => setItems(res.data)).catch(() => {});
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/ict/inventory", form);
      setOpen(false);
      setForm(empty);
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout nav={ictNav} roleLabel="ICT">
      <PageHeader
        title="Inventory"
        subtitle="Devices and SIMs issued to field staff."
        action={<button className="btn-primary" onClick={() => setOpen(true)}>Add asset</button>}
      />

      <DataTable
        emptyLabel="No assets recorded yet."
        columns={[
          { key: "assetType", header: "Type" },
          { key: "brand", header: "Brand / model", render: (r) => `${r.brand || "—"} ${r.model || ""}` },
          { key: "serialNumber", header: "Serial / IMEI", render: (r) => r.serialNumber || r.imei || "—" },
          { key: "condition", header: "Condition", render: (r) => <Badge tone={statusTone(r.condition === "active" ? "active" : "flagged")}>{r.condition}</Badge> },
          { key: "assignedToType", header: "Assigned to", render: (r) => r.assignedToType === "None" ? "Unassigned" : r.assignedToType },
        ]}
        rows={items}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add inventory asset">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Asset type</label>
            <select className="input" value={form.assetType} onChange={(e) => setForm((f) => ({ ...f, assetType: e.target.value }))}>
              <option value="phone">Phone</option>
              <option value="laptop">Laptop</option>
              <option value="tablet">Tablet</option>
              <option value="sim">SIM</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} /></div>
            <div><label className="label">Model</label><input className="input" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} /></div>
          </div>
          <div><label className="label">Serial number / IMEI</label><input className="input" value={form.serialNumber} onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))} /></div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Saving…" : "Add asset"}</button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
