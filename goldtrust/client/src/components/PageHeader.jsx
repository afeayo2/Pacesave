export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-ink">{title}</h1>
        {subtitle && <p className="text-ink/50 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
