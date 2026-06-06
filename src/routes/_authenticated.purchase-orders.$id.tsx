import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Printer, Mail } from "lucide-react";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { useData, formatCurrency } from "@/lib/store";
import type { POStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/purchase-orders/$id")({
  component: PODetailPage,
});

function PODetailPage() {
  const { id } = Route.useParams();
  const po = useData((s) => s.pos.find((p) => p.id === id));
  const rfq = useData((s) => s.rfqs.find((r) => r.id === po?.rfqId));
  const quotation = useData((s) => s.quotations.find((q) => q.id === po?.quotationId));
  const vendor = useData((s) => s.vendors.find((v) => v.id === po?.vendorId));
  const updatePO = useData((s) => s.updatePO);

  if (!po || !rfq || !quotation || !vendor) {
    return <PageBody><p>PO not found.</p></PageBody>;
  }

  return (
    <>
      <PageHeader
        title={`Invoice ${po.number}`}
        description={`${rfq.number} • ${vendor.name}`}
        actions={
          <>
            <Button asChild variant="outline"><Link to="/purchase-orders"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
            <Button variant="outline" onClick={() => toast.success("Invoice sent (demo)") }><Mail className="mr-2 h-4 w-4" />Email</Button>
            <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print / PDF</Button>
          </>
        }
      />
      <PageBody>
        <div className="flex items-center justify-between rounded-md border bg-card p-4 print:hidden">
          <div className="text-sm">Status: <StatusBadge status={po.status} /></div>
          <Select value={po.status} onValueChange={(v) => { updatePO(po.id, { status: v as POStatus }); toast.success("Status updated"); }}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-start justify-between border-b pb-6">
              <div>
                <div className="text-2xl font-bold tracking-tight">VendorBridge</div>
                <div className="text-sm text-muted-foreground">Procurement & Vendor Management</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Invoice</div>
                <div className="text-xl font-semibold">{po.number}</div>
                <div className="mt-1 text-xs text-muted-foreground">Issued {po.createdAt}</div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Vendor</div>
                <div className="mt-1 font-medium">{vendor.name}</div>
                <div className="text-sm text-muted-foreground">{vendor.email}</div>
                <div className="text-sm text-muted-foreground">{vendor.address}</div>
                <div className="text-sm text-muted-foreground font-mono">GST: {vendor.gst}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Reference</div>
                <div className="mt-1 text-sm">RFQ: {rfq.number}</div>
                <div className="text-sm">Quotation: {quotation.id}</div>
                <div className="text-sm">Delivery: {quotation.deliveryDays} days</div>
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Unit price</th>
                  <th className="py-2 text-right">Line total</th>
                </tr>
              </thead>
              <tbody>
                {rfq.items.map((it) => {
                  const line = quotation.lines.find((l) => l.itemId === it.id);
                  const unit = line?.unitPrice ?? 0;
                  return (
                    <tr key={it.id} className="border-b">
                      <td className="py-3">
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-muted-foreground">{it.specification}</div>
                      </td>
                      <td className="py-3 text-right">{it.quantity} {it.unit}</td>
                      <td className="py-3 text-right font-mono">{formatCurrency(unit)}</td>
                      <td className="py-3 text-right font-mono">{formatCurrency(unit * it.quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{formatCurrency(po.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax ({quotation.taxPercent}%)</span><span className="font-mono">{formatCurrency(po.tax)}</span></div>
                <div className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><span className="font-mono">{formatCurrency(po.total)}</span></div>
              </div>
            </div>

            {quotation.notes && (
              <div className="border-t pt-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Vendor notes</div>
                <p className="mt-1 text-sm">{quotation.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}