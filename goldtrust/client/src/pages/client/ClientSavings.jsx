import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Badge from "../../components/Badge";
import api from "../../api/client";
import { naira, shortDate } from "../../utils/format";
import { clientNav } from "./ClientDashboard";

export default function ClientSavings() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get("/clients/me/payments").then((res) => setPayments(res.data)).catch(() => {});
  }, []);

  return (
    <DashboardLayout nav={clientNav} roleLabel="Client">
      <PageHeader title="Savings & payments" subtitle="Every deposit and repayment collected on your account." />
      <DataTable
        emptyLabel="No payments recorded yet."
        columns={[
          { key: "date", header: "Date", render: (r) => shortDate(r.createdAt) },
          { key: "method", header: "Type", render: (r) => <Badge tone="green">{r.method.replace("-", " ")}</Badge> },
          { key: "ref", header: "Reference", render: (r) => <span className="font-mono text-xs text-ink/50">{r.reference}</span> },
          { key: "amount", header: "Amount", render: (r) => naira(r.amount) },
        ]}
        rows={payments}
      />
    </DashboardLayout>
  );
}
