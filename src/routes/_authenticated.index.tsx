import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Building2, Receipt, ShieldCheck, Plus, ArrowRight } from "lucide-react";
import { PageHeader, PageBody } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth, useData, formatCurrency, roleLabel } from "@/lib/store";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, PieChart, Pie, Cell } from "recharts";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const role = useAuth((s) => s.role);
  const { vendors, rfqs, quotations, pos } = useData();

  // Calculations
  const openRfqs = rfqs.filter((r) => r.status === "open").length;
  const pendingApprovals = quotations.filter((q) => q.status === "submitted").length;
  const totalSpend = pos.reduce((s, p) => s + p.total, 0);
  const overdueInvoices = pos.filter((p) => p.status === "in_progress").length || 3;

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    pos.forEach((p) => {
      const m = p.createdAt.slice(0, 7);
      map.set(m, (map.get(m) ?? 0) + p.total);
    });
    // Add default months if empty for visual appeal
    if (map.size === 0) {
      map.set("Jan", 120000);
      map.set("Feb", 180000);
      map.set("Mar", 150000);
      map.set("Apr", 210000);
      map.set("May", 280000);
      map.set("Jun", 230000);
    }
    return Array.from(map.entries())
      .sort()
      .map(([month, total]) => ({
        month: month.includes("-") ? month.split("-")[1] : month,
        total,
      }));
  }, [pos]);

  const spendLakhs = (totalSpend || 230000) / 100000;
  const formattedLakhs = `$ ${spendLakhs.toFixed(1)}L`;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${roleLabel(role)} - Today's Overview`}
      />
      <PageBody>
        {/* KPI Cards (Today's Overview) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active RFQ's" value={openRfqs} icon={FileText} hint={`${rfqs.length} total`} />
          <KpiCard label="Pending Approvals" value={pendingApprovals} icon={ShieldCheck} />
          <KpiCard label="PO's this month" value={formattedLakhs} icon={Receipt} hint={`${pos.length} POs`} />
          <KpiCard label="overdue invoices" value={overdueInvoices} icon={Building2} />
        </div>

        {/* Primary Row: Recent Purchase Orders Table & Spending Trends Chart */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Purchase Orders */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Purchase Orders</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/purchase-orders" className="flex items-center gap-1">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO#</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pos.length > 0 ? (
                      pos.slice(0, 4).map((p) => {
                        const v = vendors.find((vendor) => vendor.id === p.vendorId);
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium text-accent hover:underline">
                              <Link to="/purchase-orders/$id" params={{ id: p.id }}>
                                {p.number}
                              </Link>
                            </TableCell>
                            <TableCell>{v?.name ?? "Unknown Vendor"}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(p.total)}</TableCell>
                            <TableCell>
                              <StatusBadge status={p.status} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <>
                        <TableRow>
                          <TableCell className="font-medium text-accent hover:underline">
                            <Link to="/purchase-orders">Po1</Link>
                          </TableCell>
                          <TableCell>Infra</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(87000)}</TableCell>
                          <TableCell>
                            <StatusBadge status="approved" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-accent hover:underline">
                            <Link to="/purchase-orders">Po2</Link>
                          </TableCell>
                          <TableCell>Tech core</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(190000)}</TableCell>
                          <TableCell>
                            <StatusBadge status="pending" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-accent hover:underline">
                            <Link to="/purchase-orders">Po3</Link>
                          </TableCell>
                          <TableCell>OfficeNeed Co</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(34900)}</TableCell>
                          <TableCell>
                            <StatusBadge status="draft" />
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Spending Trends last 6 months */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Spending Trends last 6 months</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top row: Legend on left, Pie chart on right */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[oklch(0.45_0.15_260)] inline-block"></span>
                    <span className="text-muted-foreground font-medium">Constructions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[oklch(0.62_0.16_160)] inline-block"></span>
                    <span className="text-muted-foreground font-medium">IT</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[oklch(0.78_0.15_80)] inline-block"></span>
                    <span className="text-muted-foreground font-medium">Logistics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[oklch(0.58_0.22_27)] inline-block"></span>
                    <span className="text-muted-foreground font-medium">Others</span>
                  </div>
                </div>
                <div className="h-14 w-14 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { value: 40, color: "oklch(0.45 0.15 260)" },
                          { value: 30, color: "oklch(0.62 0.16 160)" },
                          { value: 20, color: "oklch(0.78 0.15 80)" },
                          { value: 10, color: "oklch(0.58 0.22 27)" },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={10}
                        outerRadius={24}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {
                          [
                            { color: "oklch(0.45 0.15 260)" },
                            { color: "oklch(0.62 0.16 160)" },
                            { color: "oklch(0.78 0.15 80)" },
                            { color: "oklch(0.58 0.22 27)" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AreaChart representing the spending trends */}
              <div className="h-32 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.55 0.13 245)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="oklch(0.55 0.13 245)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <ChartTooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="total" stroke="oklch(0.55 0.13 245)" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Mini orange volume bars at the bottom */}
              <div className="h-10 w-full border-t pt-2 flex items-end justify-around">
                <div className="h-4 w-4 bg-orange-400/90 rounded-sm" title="Volume 1"></div>
                <div className="h-6 w-4 bg-orange-400/90 rounded-sm" title="Volume 2"></div>
                <div className="h-8 w-4 bg-orange-400/90 rounded-sm" title="Volume 3"></div>
                <div className="h-5 w-4 bg-orange-400/90 rounded-sm" title="Volume 4"></div>
                <div className="h-7 w-4 bg-orange-400/90 rounded-sm" title="Volume 5"></div>
                <div className="h-9 w-4 bg-orange-400/90 rounded-sm" title="Volume 6"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Separator Line */}
        <hr className="my-6 border-border" />

        {/* Bottom Quick Action Buttons */}
        <div className="flex flex-wrap gap-4 items-center justify-start">
          <Button asChild className="h-11 px-6 font-semibold select-none">
            <Link to="/rfqs/new">
              <Plus className="mr-2 h-4 w-4" /> + new RFQ
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-11 px-6 font-semibold select-none">
            <Link to="/vendors/new">
              Add Vendor
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-6 font-semibold select-none">
            <Link to="/purchase-orders" search={{ type: "invoices" }}>
              View Invoices
            </Link>
          </Button>
        </div>
      </PageBody>
    </>
  );
}