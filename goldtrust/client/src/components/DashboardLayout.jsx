import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Coins } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ nav, roleLabel, children }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-paper flex">
      <aside className="w-64 shrink-0 bg-ink text-paper/90 flex flex-col">
        <div className="px-6 py-6 flex items-center gap-2 border-b border-white/10">
          <div className="rounded-full bg-gold-500 text-ink p-1.5">
            <Coins size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display text-lg leading-none text-white">GoldTrust</p>
            <p className="text-[11px] uppercase tracking-wide text-gold-300 mt-1">{roleLabel}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-paper/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-sm text-white font-medium truncate">{user?.fullName || "Account"}</p>
          <p className="text-xs text-paper/40 truncate mb-3">{role}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-paper/60 hover:text-white transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">{children}</div>
      </main>
    </div>
  );
}
