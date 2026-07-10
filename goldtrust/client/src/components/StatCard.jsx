export default function StatCard({ label, value, icon: Icon, hint, accent = "forest" }) {
  const accents = {
    forest: "text-forest-600 bg-forest-50",
    gold: "text-gold-700 bg-gold-100",
    rust: "text-rust bg-rust/10",
  };
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
        <p className="stat-num text-2xl mt-1.5 text-ink">{value}</p>
        {hint && <p className="text-xs text-ink/40 mt-1">{hint}</p>}
      </div>
      {Icon && (
        <div className={`rounded-full p-2.5 ${accents[accent]}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
