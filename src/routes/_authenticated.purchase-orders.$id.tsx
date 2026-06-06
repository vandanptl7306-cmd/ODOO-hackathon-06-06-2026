import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { PageBody } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useData, formatCurrency } from "@/lib/store";
import type { POStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/purchase-orders/$id")({
  component: PODetailPage,
});

export function formatPODates(createdAtStr: string) {
  const d = new Date(createdAtStr);
  if (isNaN(d.getTime())) {
    return {
      poDate: "21 may, 2025",
      invoiceDate: "22 may 2025",
      dueDate: "21 june 2025",
    };
  }

  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

  const poDate = d.toLocaleDateString("en-US", options).toLowerCase().replace(",", "");

  const invD = new Date(d);
  invD.setDate(invD.getDate() + 1);
  const invoiceDate = invD.toLocaleDateString("en-US", options).toLowerCase().replace(",", "");

  const dueD = new Date(d);
  dueD.setMonth(dueD.getMonth() + 1);
  const dueDate = dueD.toLocaleDateString("en-US", options).toLowerCase().replace(",", "");

  return { poDate, invoiceDate, dueDate };
}

export function PurchaseOrderDetailView({ poId }: { poId: string }) {
  const pos = useData((s) => s.pos);
  const rfqs = useData((s) => s.rfqs);
  const quotations = useData((s) => s.quotations);
  const vendors = useData((s) => s.vendors);
  const updatePO = useData((s) => s.updatePO);

  const po = useMemo(() => pos.find((p) => p.id === poId), [pos, poId]);
  const rfq = useMemo(() => rfqs.find((r) => r.id === po?.rfqId), [rfqs, po?.rfqId]);
  const quotation = useMemo(
    (() => quotations.find((q) => q.id === po?.quotationId)),
    [quotations, po?.quotationId]
  );
  const vendor = useMemo(() => vendors.find((v) => v.id === po?.vendorId), [vendors, po?.vendorId]);

  if (!po || !rfq || !quotation || !vendor) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">PO or Invoice details not found.</p>
      </div>
    );
  }

  const { poDate, invoiceDate, dueDate } = formatPODates(po.createdAt);

  const toggleStatus = () => {
    const nextStatus: POStatus = po.status === "pending_payment" ? "paid" : "pending_payment";
    updatePO(po.id, { status: nextStatus });
    toast.success(`Status updated to ${nextStatus === "paid" ? "Paid" : "Pending Payment"}`);
  };

  const cGst = po.tax / 2;
  const sGst = po.tax / 2;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[oklch(0.25_0.08_260)] animate-in fade-in duration-300">
            Purchase Order & Invoice
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {po.number}-auto-generated after approval
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toast.success("PDF Downloaded successfully")}
            className="h-10 border-border font-semibold select-none cursor-pointer"
          >
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-10 border-border font-semibold select-none cursor-pointer"
          >
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("Invoice sent to vendor via email")}
            className="h-10 border-border font-semibold select-none cursor-pointer"
          >
            Email invoice
          </Button>
        </div>
      </div>

      {/* Main Billing and Details Box */}
      <Card className="border border-border/60 shadow-sm bg-white">
        <CardContent className="p-8 space-y-6">
          {/* Bill to / Vendor Split */}
          <div className="grid gap-6 sm:grid-cols-2 text-sm">
            {/* Bill to Organization */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                Bill to:
              </span>
              <p className="font-semibold text-base text-[oklch(0.25_0.08_260)]">
                your Organization Name
              </p>
              <p className="text-muted-foreground leading-relaxed">
                123 business park, ahmedabad
              </p>
              <p className="font-mono text-muted-foreground">GSTIN:25383438AFB</p>
            </div>

            {/* Vendor Profile */}
            <div className="space-y-1 sm:text-right">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                Vendor
              </span>
              <p className="font-semibold text-base text-[oklch(0.25_0.08_260)]">{vendor.name}</p>
              <p className="text-muted-foreground leading-relaxed">
                456, industrial estate, surat
              </p>
              <p className="font-mono text-muted-foreground">GSTIN: {vendor.gst || "343434DB4523"}</p>
            </div>
          </div>

          {/* Horizontal Divider */}
          <hr className="border-border" />

          {/* Reference Numbers and Dates Split */}
          <div className="grid gap-6 sm:grid-cols-2 text-sm">
            <div className="space-y-1.5">
              <p className="text-muted-foreground">
                <span className="font-semibold text-[oklch(0.25_0.08_260)]">PO Number:</span> {po.number}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-[oklch(0.25_0.08_260)]">PO date:</span> {poDate}
              </p>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <p className="text-muted-foreground">
                <span className="font-semibold text-[oklch(0.25_0.08_260)]">invoice date:</span> {invoiceDate}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-[oklch(0.25_0.08_260)]">Due date:</span> {dueDate}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Table Card */}
      <Card className="border border-border/60 shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-semibold text-xs py-3">Item</TableHead>
              <TableHead className="font-semibold text-xs py-3 w-24">Qty</TableHead>
              <TableHead className="font-semibold text-xs py-3 w-36">Unit price</TableHead>
              <TableHead className="font-semibold text-xs py-3 w-36 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfq.items.map((it) => {
              const line = quotation.lines.find((l) => l.itemId === it.id);
              const price = line?.unitPrice ?? 0;
              const lineTotal = it.quantity * price;

              return (
                <TableRow key={it.id} className="hover:bg-muted/5 transition-colors duration-150 border-b">
                  <TableCell className="font-medium text-sm text-[oklch(0.25_0.08_260)] py-3">
                    {it.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm py-3">{it.quantity}</TableCell>
                  <TableCell className="font-mono text-sm py-3">{price}</TableCell>
                  <TableCell className="font-mono font-semibold text-sm text-[oklch(0.25_0.08_260)] py-3 text-right">
                    {formatCurrency(lineTotal)}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Calculations lines */}
            <TableRow className="hover:bg-transparent border-0">
              <TableCell colSpan={2} className="border-0"></TableCell>
              <TableCell className="text-sm font-semibold text-muted-foreground text-right border-0 py-2">
                Subtotal
              </TableCell>
              <TableCell className="font-mono font-medium text-sm text-right text-[oklch(0.25_0.08_260)] border-0 py-2">
                {formatCurrency(po.subtotal)}
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-transparent border-0">
              <TableCell colSpan={2} className="border-0"></TableCell>
              <TableCell className="text-sm font-semibold text-muted-foreground text-right border-0 py-2">
                CGST(9%)
              </TableCell>
              <TableCell className="font-mono font-medium text-sm text-right text-[oklch(0.25_0.08_260)] border-0 py-2">
                {formatCurrency(cGst)}
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-transparent border-0">
              <TableCell colSpan={2} className="border-0"></TableCell>
              <TableCell className="text-sm font-semibold text-muted-foreground text-right border-0 py-2">
                SGST(9%)
              </TableCell>
              <TableCell className="font-mono font-medium text-sm text-right text-[oklch(0.25_0.08_260)] border-0 py-2">
                {formatCurrency(sGst)}
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-transparent border-t">
              <TableCell colSpan={2} className="border-0"></TableCell>
              <TableCell className="text-sm font-bold text-[oklch(0.25_0.08_260)] text-right border-0 py-3">
                Grand total
              </TableCell>
              <TableCell className="font-mono font-bold text-base text-right text-[oklch(0.25_0.08_260)] border-0 py-3">
                {formatCurrency(po.total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Bottom Status & Paid Toggle Action */}
      <div className="flex items-center gap-3 text-sm pt-2">
        <span className="font-medium text-muted-foreground">status:</span>
        <StatusBadge status={po.status} />
        <button
          type="button"
          onClick={toggleStatus}
          className="text-accent hover:underline font-semibold cursor-pointer ml-2"
        >
          {po.status === "pending_payment" ? "Mark as Paid" : "Mark as Pending"}
        </button>
      </div>
    </div>
  );
}

function PODetailPage() {
  const { id } = Route.useParams();
  return (
    <>
      <PageBody>
        <PurchaseOrderDetailView poId={id} />
      </PageBody>
    </>
  );
}