import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Building2, Receipt, ShieldCheck, Send, BarChart3 } from "lucide-react";
import { PageHeader, PageBody } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth, useData, formatCurrency, roleLabel } from "@/lib/store";
import type { LucideIcon } from "lucide-react";

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active vendors" value={activeVendors} icon={Building2} hint={`${vendors.length} total`} />
          <KpiCard label="Open RFQs" value={openRfqs} icon={FileText} hint={`${rfqs.length} total`} />
          <KpiCard label="Pending approvals" value={pendingApprovals} icon={ShieldCheck} />
          <KpiCard label="Total PO value" value={formatCurrency(totalSpend)} icon={Receipt} hint={`${pos.length} POs`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent RFQs</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/rfqs">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {rfqs.slice(0, 5).map((r) => (
                  <Link
                    key={r.id}
                    to="/rfqs/$id"
                    params={{ id: r.id }}
                    className="flex items-center justify-between py-3 hover:bg-muted/40 rounded px-2 -mx-2"
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Activity</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/activity">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {activity.slice(0, 6).map((a) => (
                  <li key={a.id} className="text-sm">
                    <div className="font-medium">{a.action}</div>
                    <div className="text-xs text-muted-foreground">{a.detail}</div>
                    <div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <QuickLink to="/vendors" icon={Building2} title="Vendors" body="Register and manage suppliers" />
          <QuickLink to="/quotations" icon={Send} title="Quotations" body="Submit or review vendor quotes" />
          <QuickLink to="/reports" icon={BarChart3} title="Reports" body="Spend trends and analytics" />
        </div>
      </PageBody>
    </>
  );
}

function QuickLink({ to, icon: Icon, title, body }: { to: string; icon: LucideIcon; title: string; body: string }) {
  return (
    <Link to={to} className="group rounded-lg border bg-card p-5 hover:border-accent hover:shadow-sm transition">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{body}</div>
        </div>
      </div>
    </Link>
  );
}