import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, GitCompare } from "lucide-react";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { useData, formatCurrency } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/rfqs/$id")({
  component: RfqDetailPage,
});

function RfqDetailPage() {
  const { id } = Route.useParams();
  const rfq = useData((s) => s.rfqs.find((r) => r.id === id));
  const vendors = useData((s) => s.vendors);
  const quotations = useData((s) => s.quotations.filter((q) => q.rfqId === id));

  if (!rfq) {
    return (
      <PageBody>
        <p>RFQ not found.</p>
        <Button asChild className="mt-4"><Link to="/rfqs">Back</Link></Button>
      </PageBody>
    );
  }

  return (
    <>
      <PageHeader
        title={rfq.title}
        description={`${rfq.number} • Deadline ${rfq.deadline}`}
        actions={
          <>
            <Button asChild variant="outline"><Link to="/rfqs"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
            {quotations.length > 0 && (
              <Button asChild>
                <Link to="/rfqs/$id/compare" params={{ id: rfq.id }}>
                  <GitCompare className="mr-2 h-4 w-4" /> Compare quotes
                </Link>
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line items</CardTitle>
              <StatusBadge status={rfq.status} />
            </CardHeader>
            <CardContent>
              {rfq.description && <p className="mb-4 text-sm text-muted-foreground">{rfq.description}</p>}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Spec</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfq.items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{i.specification}</TableCell>
                      <TableCell className="text-right">{i.quantity}</TableCell>
                      <TableCell>{i.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Invited vendors</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {rfq.invitedVendorIds.map((vid) => {
                  const v = vendors.find((x) => x.id === vid);
                  const q = quotations.find((qq) => qq.vendorId === vid);
                  return (
                    <li key={vid} className="flex items-center justify-between text-sm">
                      <span>{v?.name ?? vid}</span>
                      {q ? <StatusBadge status={q.status} /> : <span className="text-xs text-muted-foreground">Awaiting quote</span>}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Quotations received ({quotations.length})</CardTitle></CardHeader>
          <CardContent>
            {quotations.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No quotations yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead className="text-right">Total (incl. tax)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((q) => {
                    const v = vendors.find((vv) => vv.id === q.vendorId);
                    const subtotal = q.lines.reduce((s, l) => {
                      const it = rfq.items.find((i) => i.id === l.itemId);
                      return s + (it ? it.quantity * l.unitPrice : 0);
                    }, 0);
                    const total = subtotal * (1 + q.taxPercent / 100);
                    return (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{v?.name}</TableCell>
                        <TableCell>{q.deliveryDays} days</TableCell>
                        <TableCell>{q.taxPercent}%</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(total)}</TableCell>
                        <TableCell><StatusBadge status={q.status} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}