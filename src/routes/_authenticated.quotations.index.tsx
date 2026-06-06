import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useData, formatCurrency } from "@/lib/store";
import type { QuotationStatus } from "@/lib/types";

const searchSchema = z.object({
  rfqId: z.string().optional(),
  vendorId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/quotations/")({
  validateSearch: searchSchema.parse,
  component: VendorQuotationsPage,
});

function VendorQuotationsPage() {
  const navigate = useNavigate();
  const { rfqId: paramRfqId, vendorId: paramVendorId } = Route.useSearch();

  const rfqId = paramRfqId || "r3";
  const vendorId = paramVendorId || "v1";

  const rfqs = useData((s) => s.rfqs);
  const quotations = useData((s) => s.quotations);

  const rfq = useMemo(() => rfqs.find((r) => r.id === rfqId), [rfqs, rfqId]);
  const existing = useMemo(
    () => quotations.find((q) => q.rfqId === rfqId && q.vendorId === vendorId),
    [quotations, rfqId, vendorId]
  );

  const addQuotation = useData((s) => s.addQuotation);
  const updateQuotation = useData((s) => s.updateQuotation);

  // Prepopulate prices matching wireframe defaults if no existing quote
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (rfq?.items ?? []).map((i) => [
        i.id,
        existing?.lines.find((l) => l.itemId === i.id)?.unitPrice ??
          (i.name.toLowerCase().includes("chair") ? 3500 : 8200),
      ])
    )
  );

  // Prepopulate delivery days matching wireframe defaults if no existing quote
  const [deliveries, setDeliveries] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (rfq?.items ?? []).map((i) => [
        i.id,
        existing?.lines.find((l) => l.itemId === i.id)?.deliveryDays ??
          (i.name.toLowerCase().includes("chair") ? 7 : 14),
      ])
    )
  );

  const [tax, setTax] = useState(existing?.taxPercent ?? 18);
  const [notes, setNotes] = useState(existing?.notes ?? "Payment terms: 20 days net...");

  if (!rfq) {
    return (
      <PageBody>
        <p>RFQ not found.</p>
      </PageBody>
    );
  }

  // Format labels in lowercase to match wireframe sketch visual exactly
  const rfqTitleLower = rfq.title.toLowerCase();
  const rfqDeadlineLower = rfq.deadline.toLowerCase();

  const summaryText =
    rfq.items.map((i) => `${i.name.toLowerCase()} * ${i.quantity}`).join(", ") +
    ` - category ${(rfq.category || "furniture").toLowerCase()}`;

  const subtotal = rfq.items.reduce((s, i) => s + (prices[i.id] ?? 0) * i.quantity, 0);
  const gstAmount = subtotal * (tax / 100);
  const total = subtotal + gstAmount;

  const handleSave = (status: QuotationStatus) => {
    const lines = rfq.items.map((i) => ({
      itemId: i.id,
      unitPrice: prices[i.id] ?? 0,
      deliveryDays: deliveries[i.id] ?? 14,
    }));
    const maxDelivery = Math.max(...Object.values(deliveries), 1);

    if (existing) {
      updateQuotation(existing.id, {
        lines,
        deliveryDays: maxDelivery,
        taxPercent: tax,
        notes,
        status,
      });
      toast.success(status === "draft" ? "Quote saved as draft" : "Quote submitted");
    } else {
      addQuotation({
        rfqId,
        vendorId,
        lines,
        deliveryDays: maxDelivery,
        taxPercent: tax,
        notes,
        status,
      });
      toast.success(status === "draft" ? "Quote saved as draft" : "Quote submitted");
    }
    // Redirect to Dashboard on submission/draft
    navigate({ to: "/" });
  };

  return (
    <>
      <PageHeader
        title="Submit Quotations"
        description={`RFQ: ${rfqTitleLower} - deadline ${rfqDeadlineLower}`}
      />
      <PageBody>
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
          {/* RFQ Summary Card */}
          <Card className="border border-border/60 shadow-sm bg-white">
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                RFQ Summary
              </span>
              <p className="text-sm font-medium text-[oklch(0.25_0.08_260)]">
                {summaryText}
              </p>
            </CardContent>
          </Card>

          {/* Your Quotation Title */}
          <div className="pt-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Your Quotation
            </h2>
          </div>

          {/* Quotation Table */}
          <Card className="border border-border/60 shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold text-xs py-3">Item</TableHead>
                  <TableHead className="font-semibold text-xs py-3 w-24">Qty</TableHead>
                  <TableHead className="font-semibold text-xs py-3 w-36">Unit price</TableHead>
                  <TableHead className="font-semibold text-xs py-3 w-36">Total</TableHead>
                  <TableHead className="font-semibold text-xs py-3 w-36">Delivery (days)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfq.items.map((it) => {
                  const qty = it.quantity;
                  const price = prices[it.id] ?? 0;
                  const lineTotal = qty * price;

                  return (
                    <TableRow key={it.id} className="hover:bg-muted/5 transition-colors duration-150">
                      <TableCell className="font-medium text-sm text-[oklch(0.25_0.08_260)] py-3">
                        {it.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm py-3">{qty}</TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          min={0}
                          value={price}
                          onChange={(e) =>
                            setPrices({ ...prices, [it.id]: +e.target.value })
                          }
                          className="h-9 border-border bg-white text-sm"
                        />
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-sm text-[oklch(0.25_0.08_260)] py-3">
                        {formatCurrency(lineTotal)}
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          min={1}
                          value={deliveries[it.id] ?? 14}
                          onChange={(e) =>
                            setDeliveries({ ...deliveries, [it.id]: +e.target.value })
                          }
                          className="h-9 border-border bg-white text-sm"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Separator line */}
          <hr className="my-6 border-border" />

          {/* Bottom split form and calculations */}
          <div className="grid gap-6 md:grid-cols-2 items-start">
            {/* Left Column: Tax & Note/Terms */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="tax" className="font-semibold text-sm text-muted-foreground">
                  tax / GST %
                </Label>
                <Input
                  id="tax"
                  type="number"
                  min={0}
                  value={tax}
                  onChange={(e) => setTax(+e.target.value)}
                  className="h-10 border-border bg-white max-w-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="font-semibold text-sm text-muted-foreground">
                  Note / terms
                </Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms, warranty etc..."
                  className="border-border bg-white resize-none"
                />
              </div>
            </div>

            {/* Right Column: Pricing Summary Card */}
            <Card className="border border-border bg-white shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono font-medium text-[oklch(0.25_0.08_260)]">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>GST ({tax}%)</span>
                    <span className="font-mono font-medium text-[oklch(0.25_0.08_260)]">
                      {formatCurrency(gstAmount)}
                    </span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-[oklch(0.25_0.08_260)] text-sm">Grand total</span>
                    <span className="font-mono font-bold text-lg text-[oklch(0.25_0.08_260)]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Actions buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={() => handleSave("submitted")}
              className="h-11 px-6 font-semibold select-none shadow-sm cursor-pointer"
            >
              Submit Quotation
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave("draft")}
              className="h-11 px-6 font-semibold select-none border-border hover:bg-muted/50 cursor-pointer"
            >
              Save Draft
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}