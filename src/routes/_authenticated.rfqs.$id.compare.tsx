import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Star, TrendingDown, Zap } from "lucide-react";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useData, formatCurrency } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/rfqs/$id/compare")({
  component: ComparePage,
});

function ComparePage() {
  const { id } = Route.useParams();
  const rfq = useData((s) => s.rfqs.find((r) => r.id === id));
  const vendors = useData((s) => s.vendors);
  const allQuotations = useData((s) => s.quotations);
  const quotations = useMemo(() => allQuotations.filter((q) => q.rfqId === id), [allQuotations, id]);

  if (!rfq) return <PageBody><p>RFQ not found.</p></PageBody>;

  const enriched = quotations.map((q) => {
    const subtotal = q.lines.reduce((sum, l) => {
      const it = rfq.items.find((i) => i.id === l.itemId);
      return sum + (it ? it.quantity * l.unitPrice : 0);
    }, 0);
    return { q, vendor: vendors.find((v) => v.id === q.vendorId), subtotal, total: subtotal * (1 + q.taxPercent / 100) };
  });

  const lowestTotal = Math.min(...enriched.map((e) => e.total));
  const fastest = Math.min(...enriched.map((e) => e.q.deliveryDays));

  return (
    <>
      <PageHeader
        title={`Compare quotations — ${rfq.title}`}
        description={`${rfq.number} • ${enriched.length} quotation(s)`}
        actions={<Button asChild variant="outline"><Link to="/rfqs/$id" params={{ id: rfq.id }}><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>}
      />
      <PageBody>
        <div className={cn("grid gap-4", enriched.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
          {enriched.map(({ q, vendor, subtotal, total }) => {
            const isLowest = total === lowestTotal;
            const isFastest = q.deliveryDays === fastest;
            return (
              <Card key={q.id} className={cn("relative overflow-hidden", isLowest && "ring-2 ring-success")}>
                {isLowest && (
                  <div className="absolute right-0 top-0 bg-success px-3 py-1 text-xs font-medium text-success-foreground rounded-bl">
                    Best price
                  </div>
                )}
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="text-lg font-semibold">{vendor?.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {vendor?.rating.toFixed(1)} • {vendor?.category}
                    </div>
                  </div>

                  <div className="space-y-2 border-y py-3">
                    {rfq.items.map((it) => {
                      const line = q.lines.find((l) => l.itemId === it.id);
                      return (
                        <div key={it.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{it.name} × {it.quantity}</span>
                          <span className="font-mono">{line ? formatCurrency(line.unitPrice) : "—"}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <Row label="Subtotal" value={formatCurrency(subtotal)} />
                    <Row label={`Tax (${q.taxPercent}%)`} value={formatCurrency(subtotal * q.taxPercent / 100)} />
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-medium">Total</span>
                      <span className={cn("font-mono text-lg font-semibold", isLowest && "text-success")}>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-1", isFastest ? "border-accent/40 bg-accent/10 text-accent" : "text-muted-foreground")}>
                      <Zap className="h-3 w-3" /> {q.deliveryDays} days
                    </span>
                    {isLowest && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-1 text-success">
                        <TrendingDown className="h-3 w-3" /> Lowest cost
                      </span>
                    )}
                  </div>

                  {q.notes && <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">{q.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">
          To approve a quotation, go to <Link to="/approvals" className="text-accent hover:underline">Approvals</Link>.
        </p>
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