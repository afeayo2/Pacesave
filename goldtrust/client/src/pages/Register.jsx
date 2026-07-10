import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coins } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    savingsType: "Daily",
    targetAmount: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register/client", {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        savings: {
          type: form.savingsType,
          targetAmount: Number(form.targetAmount) || 0,
          duration: "6 months",
          method: "Cash",
        },
      });
      login(data);
      navigate("/client");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="rounded-full bg-forest-600 text-white p-1.5">
            <Coins size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl text-ink">GoldTrust</span>
        </Link>

        <div className="card p-7">
          <h1 className="font-display text-xl text-ink mb-1">Open a savings account</h1>
          <p className="text-sm text-ink/50 mb-6">Start saving today, borrow when you're ready.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Phone</label>
                <input className="input" required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" required value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" required value={form.password} onChange={(e) => update("password", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Savings rhythm</label>
                <select className="input" value={form.savingsType} onChange={(e) => update("savingsType", e.target.value)}>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                <label className="label">Savings goal (₦)</label>
                <input type="number" min="0" className="input" value={form.targetAmount} onChange={(e) => update("targetAmount", e.target.value)} />
              </div>
            </div>

            {error && <p className="text-sm text-rust bg-rust/10 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating account…" : "Create my account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink/50 mt-6">
          Already have an account? <Link to="/login" className="text-forest-600 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
