import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import api from "../../api/client";
import { clientNav } from "./ClientDashboard";
import { useAuth } from "../../context/AuthContext";

export default function ClientProfile() {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/auth/me").then((res) => setForm(res.data.user)).catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await api.put("/clients/me/profile", {
        fullName: form.fullName,
        email: form.email,
        address: form.address,
      });
      await refreshUser();
      setMsg("Profile updated.");
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not update profile.");
    } finally {
      setBusy(false);
    }
  }

  if (!form) return null;

  return (
    <DashboardLayout nav={clientNav} roleLabel="Client">
      <PageHeader title="Profile" subtitle="Keep your contact details up to date." />
      <form onSubmit={submit} className="card p-6 max-w-lg space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.fullName || ""} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Phone (fixed)</label>
          <input className="input opacity-60" value={form.phone || ""} disabled />
        </div>
        <div>
          <label className="label">City</label>
          <input
            className="input"
            value={form.address?.city || ""}
            onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
          />
        </div>
        {msg && <p className="text-sm text-forest-700 bg-forest-50 rounded-lg px-3 py-2">{msg}</p>}
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
      </form>
    </DashboardLayout>
  );
}
