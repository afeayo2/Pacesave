// Signature element: a coin-stack progress ring toward a client's savings goal.
export default function SavingsRing({ value = 0, target = 1, size = 152 }) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EAF3EE" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#C6A15B"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-semibold text-forest-700">{Math.round(pct * 100)}%</span>
        <span className="text-[10px] uppercase tracking-wide text-ink/40 mt-0.5">of goal</span>
      </div>
    </div>
  );
}
