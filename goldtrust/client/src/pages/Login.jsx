import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coins } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "client", label: "Client" },
  { value: "staff", label: "Staff" },
  { value: "frontdesk", label: "Front desk" },
  { value: "ict", label: "ICT" },
  { value: "admin", label: "Admin" },
];

export default function Login() {
  const [role, setRole] = useState("client");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { role, identifier, password });
      login(data);
      navigate(`/${role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your details and try again.");
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
          <h1 className="font-display text-xl text-ink mb-1">Welcome back</h1>
          <p className="text-sm text-ink/50 mb-6">Sign in to your desk.</p>

          <div className="flex flex-wrap gap-1.5 mb-6 p-1 bg-forest-50 rounded-full">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex-1 min-w-[18%] text-xs font-semibold px-2 py-2 rounded-full transition-colors ${
                  role === r.value ? "bg-white text-forest-700 shadow-sm" : "text-ink/45 hover:text-ink/70"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email or phone</label>
              <input
                className="input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-sm text-rust bg-rust/10 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink/50 mt-6">
          New here? <Link to="/register" className="text-forest-600 font-semibold">Open a client account</Link>
        </p>
      </div>
    </div>
  );
}
