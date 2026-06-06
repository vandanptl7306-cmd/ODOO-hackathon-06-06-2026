import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useData, formatCurrency } from "@/lib/store";

const search = z.object({ vendorId: z.string() });

export const Route = createFileRoute("/_authenticated/quotations/$rfqId/submit")({
  validateSearch: search.parse,
  component: SubmitQuotePage,
});

function SubmitQuotePage() {
  const { rfqId } = Route.useParams();
  const { vendorId } = Route.useSearch();
  const navigate = useNavigate();
  const rfq = useData((s) => s.rfqs.find((r) => r.id === rfqId));
  const existing = useData((s) => s.quotations.find((q) => q.rfqId === rfqId && q.vendorId === vendorId));
  const addQuotation = useData((s) => s.addQuotation);
  const updateQuotation = useData((s) => s.updateQuotation);

  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries((rfq?.items ?? []).map((i) => [i.id, existing?.lines.find((l) => l.itemId === i.id)?.unitPrice ?? 0])),
  );
  const [delivery, setDelivery] = useState(existing?.deliveryDays ?? 14);
  const [tax, setTax] = useState(existing?.taxPercent ?? 18);
  const [notes, setNotes] = useState(existing?.notes ?? "");

  if (!rfq) return <PageBody><p>RFQ not found.</p></PageBody>;

  const subtotal = rfq.items.reduce((s, i) => s + (prices[i.id] ?? 0) * i.quantity, 0);
  const total = subtotal * (1 + tax / 100);

  return (
    <>
      <PageHeader title={`Submit quote — ${rfq.number}`} description={rfq.title} />
      <PageBody>
        <form
          className="grid gap-6 lg:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            const lines = rfq.items.map((i) => ({ itemId: i.id, unitPrice: prices[i.id] ?? 0 }));
            if (existing) {
              updateQuotation(existing.id, { lines, deliveryDays: delivery, taxPercent: tax, notes });
              toast.success("Quote updated");
            } else {
              addQuotation({ rfqId, vendorId, lines, deliveryDays: delivery, taxPercent: tax, notes });
              toast.success("Quote submitted");
            }
            navigate({ to: "/quotations" });
          }}
        >
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Line item pricing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {rfq.items.map((it) => (
                <div key={it.id} className="grid grid-cols-12 items-end gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="col-span-7">
                    <div className="text-sm font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.specification} • {it.quantity} {it.unit}</div>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs">Unit price</Label>
                    <Input type="number" min={0} value={prices[it.id] ?? 0} onChange={(e) => setPrices({ ...prices, [it.id]: +e.target.value })} />
                  </div>
                  <div className="col-span-2 text-right text-sm font-mono">
                    {formatCurrency((prices[it.id] ?? 0) * it.quantity)}
                  </div>
                </div>
              ))}
              <div className="space-y-2 pt-2">
                <Label>Notes</Label>
                <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Bulk discount, warranty, etc." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Delivery (days)</Label>
                <Input type="number" min={1} value={delivery} onChange={(e) => setDelivery(+e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tax %</Label>
                <Input type="number" min={0} value={tax} onChange={(e) => setTax(+e.target.value)} />
              </div>
              <div className="border-t pt-3 space-y-1.5 text-sm">
                <Row label="Subtotal" value={formatCurrency(subtotal)} />
                <Row label={`Tax (${tax}%)`} value={formatCurrency(subtotal * tax / 100)} />
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-mono text-lg font-semibold">{formatCurrency(total)}</span>
                </div>
              </div>
              <Button type="submit" className="w-full">{existing ? "Update quote" : "Submit quote"}</Button>
            </CardContent>
          </Card>
        </form>
      </PageBody>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}