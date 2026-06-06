import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { Download } from "lucide-react";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/kpi-card";
import { Receipt, TrendingUp, Building2, FileText } from "lucide-react";
import { useData, formatCurrency } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

const palette = ["oklch(0.45 0.15 260)", "oklch(0.62 0.16 160)", "oklch(0.78 0.15 80)", "oklch(0.58 0.22 27)", "oklch(0.65 0.12 200)"];

function ReportsPage() {
  const pos = useData((s) => s.pos);
  const vendors = useData((s) => s.vendors);
  const rfqs = useData((s) => s.rfqs);

  const totalSpend = pos.reduce((s, p) => s + p.total, 0);

  const spendByVendor = useMemo(() => {
    const map = new Map<string, number>();
    pos.forEach((p) => map.set(p.vendorId, (map.get(p.vendorId) ?? 0) + p.total));
    return Array.from(map.entries()).map(([vid, total]) => ({
      name: vendors.find((v) => v.id === vid)?.name ?? "—",
      total,
    }));
  }, [pos, vendors]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    pos.forEach((p) => {
      const m = p.createdAt.slice(0, 7);
      map.set(m, (map.get(m) ?? 0) + p.total);
    });
    return Array.from(map.entries()).sort().map(([month, total]) => ({ month, total }));
  }, [pos]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    pos.forEach((p) => {
      const cat = vendors.find((v) => v.id === p.vendorId)?.category ?? "Other";
      map.set(cat, (map.get(cat) ?? 0) + p.total);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [pos, vendors]);

  const exportCsv = () => {
    const rows = ["Name,Category,Status,Rating,GST", ...vendors.map((v) => `"${v.name}","${v.category}",${v.status},${v.rating},${v.gst}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vendors.csv";
    a.click();
  };

  return (
    <>
      <PageHeader
        title="Reports & analytics"
        description="Procurement spend, vendor mix, and trends."
        actions={<Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export vendors</Button>}
      />
      <PageBody>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total spend" value={formatCurrency(totalSpend)} icon={Receipt} />
          <KpiCard label="Active vendors" value={vendors.filter((v) => v.status === "active").length} icon={Building2} />
          <KpiCard label="RFQs issued" value={rfqs.length} icon={FileText} />
          <KpiCard label="Avg PO value" value={formatCurrency(pos.length ? totalSpend / pos.length : 0)} icon={TrendingUp} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Spend by vendor</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                {spendByVendor.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendByVendor}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="total" fill="oklch(0.55 0.13 245)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Monthly procurement trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                {monthlyTrend.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Line type="monotone" dataKey="total" stroke="oklch(0.45 0.15 260)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Spend by category</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                {byCategory.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={100} label>
                        {byCategory.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

function EmptyChart() {
  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet — approve a quotation to see spend.</div>;
}