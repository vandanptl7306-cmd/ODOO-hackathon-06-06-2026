import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Building2, Receipt, ShieldCheck, Send, BarChart3 } from "lucide-react";
import { PageHeader, PageBody } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth, useData, formatCurrency, roleLabel } from "@/lib/store";
import type { LucideIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip } from "recharts";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const role = useAuth((s) => s.role);
  const { vendors, rfqs, quotations, pos, activity } = useData();

  const totalSpend = pos.reduce((s, p) => s + p.total, 0);
  const pendingApprovals = quotations.filter((q) => q.status === "submitted").length;
  const openRfqs = rfqs.filter((r) => r.status === "open").length;
  const activeVendors = vendors.filter((v) => v.status === "active").length;

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    pos.forEach((p) => {
      const m = p.createdAt.slice(0, 7);
      map.set(m, (map.get(m) ?? 0) + p.total);
    });
    // Add default months if empty for initial visual appeal
    if (map.size === 0) {
      map.set("Apr", 120000);
      map.set("May", 280000);
      map.set("Jun", 190000);
    }
    return Array.from(map.entries())
      .sort()
      .map(([month, total]) => ({
        month: month.includes("-") ? month.split("-")[1] : month,
        total,
      }));
  }, [pos]);

  return (
    <>
      <PageHeader
        title={`Welcome, ${roleLabel(role)}`}
        description="Snapshot of procurement activity across your workspace."
        actions={
          role === "officer" ? (
            <Button asChild>
              <Link to="/rfqs/new">
                <FileText className="mr-2 h-4 w-4" /> New RFQ
              </Link>
            </Button>
          ) : null
        }
      />
      <PageBody>
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active vendors" value={activeVendors} icon={Building2} hint={`${vendors.length} total`} />
          <KpiCard label="Open RFQs" value={openRfqs} icon={FileText} hint={`${rfqs.length} total`} />
          <KpiCard label="Pending approvals" value={pendingApprovals} icon={ShieldCheck} />
          <KpiCard label="Total PO value" value={formatCurrency(totalSpend)} icon={Receipt} hint={`${pos.length} POs`} />
        </div>

        {/* Primary Row: Recent RFQs & Spends Chart */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent RFQs</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/rfqs">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {rfqs.slice(0, 4).map((r) => (
                  <Link
                    key={r.id}
                    to="/rfqs/$id"
                    params={{ id: r.id }}
                    className="flex items-center justify-between py-3 hover:bg-muted/40 rounded px-2 -mx-2 transition-colors duration-150"
                  >
                    <div>
                      <div className="text-sm font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.number} • Deadline {r.deadline}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </Link>
                ))}
                {rfqs.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No RFQs yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Spend Trend</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-[calc(100%-60px)]">
              <div className="h-44 w-full mt-2">
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
              <div className="text-center text-xs text-muted-foreground mt-4">
                Monthly PO spend analytics
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Row: Activity & Quick Navigation */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Activity</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/activity">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {activity.slice(0, 3).map((a) => (
                  <li key={a.id} className="text-sm flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-accent shrink-0" />
                    <div>
                      <div className="font-medium">{a.action}</div>
                      <div className="text-xs text-muted-foreground">{a.detail}</div>
                      <div className="text-[10px] text-muted-foreground/80">{new Date(a.at).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
                {activity.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No activities logged.</p>
                )}
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <QuickLink to="/vendors" icon={Building2} title="Vendors" body="Register and manage suppliers" />
            <QuickLink to="/quotations" icon={Send} title="Quotations" body="Submit or review vendor quotes" />
            <QuickLink to="/reports" icon={BarChart3} title="Reports" body="Spend trends and analytics" />
          </div>
        </div>
      </PageBody>
    </>
  );
}

function QuickLink({ to, icon: Icon, title, body }: { to: string; icon: LucideIcon; title: string; body: string }) {
  return (
    <Link to={to} className="group rounded-lg border bg-card p-4 hover:border-accent hover:shadow-sm transition duration-200">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent group-hover:scale-105 transition-transform duration-200">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium text-sm">{title}</div>
          <div className="text-xs text-muted-foreground">{body}</div>
        </div>
      </div>
    </Link>
  );
}