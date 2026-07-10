const styles = {
  green: "bg-forest-50 text-forest-700",
  gold: "bg-gold-100 text-gold-700",
  red: "bg-rust/10 text-rust",
  gray: "bg-ink/5 text-ink/60",
};

export default function Badge({ tone = "gray", children }) {
  return <span className={`badge ${styles[tone] || styles.gray}`}>{children}</span>;
}

export function statusTone(status) {
  const map = {
    active: "green",
    approved: "green",
    paid: "green",
    resolved: "green",
    pending: "gold",
    open: "gold",
    unpaid: "gold",
    rejected: "red",
    flagged: "red",
    inactive: "gray",
  };
  return map[status] || "gray";
}
