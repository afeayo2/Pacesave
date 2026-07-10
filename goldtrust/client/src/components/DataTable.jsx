export default function DataTable({ columns, rows, emptyLabel = "Nothing here yet" }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="card p-10 text-center text-sm text-ink/40">{emptyLabel}</div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest-100 bg-forest-50/40">
              {columns.map((col) => (
                <th key={col.key} className="text-left font-semibold text-ink/50 uppercase text-xs tracking-wide px-4 py-3 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row._id || i} className="border-b border-forest-100/70 last:border-0 hover:bg-forest-50/30 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
