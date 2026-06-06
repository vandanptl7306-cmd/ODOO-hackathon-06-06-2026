import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { PageHeader, PageBody, EmptyState } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useData, useAuth, formatCurrency } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/approvals")({
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const user = useAuth((s) => s.user);
  const quotations = useData((s) => s.quotations.filter((q) => q.status === "submitted"));
  const rfqs = useData((s) => s.rfqs);
  const vendors = useData((s) => s.vendors);
  const approve = useData((s) => s.approveQuotation);
  const reject = useData((s) => s.rejectQuotation);

  return (
    <>
      <PageHeader title="Approvals" description="Review pending vendor quotations and approve or reject." />
      <PageBody>
        {quotations.length === 0 ? (
          <EmptyState title="Nothing waiting" description="All submitted quotations have been actioned." />
        ) : (
          <div className="grid gap-4">
            {quotations.map((q) => {
              const rfq = rfqs.find((r) => r.id === q.rfqId)!;
              const vendor = vendors.find((v) => v.id === q.vendorId);
              const subtotal = q.lines.reduce((s, l) => {
                const it = rfq?.items.find((i) => i.id === l.itemId);
                return s + (it ? it.quantity * l.unitPrice : 0);
              }, 0);
              const total = subtotal * (1 + q.taxPercent / 100);
              return (
                <Card key={q.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">{vendor?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        <Link to="/rfqs/$id" params={{ id: rfq.id }} className="hover:underline">{rfq.number} — {rfq.title}</Link>
                      </div>
                      <div className="text-xs text-muted-foreground">Delivery {q.deliveryDays} days • Submitted {new Date(q.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="font-mono text-lg font-semibold">{formatCurrency(total)}</div>
                    </div>
                    <div className="flex gap-2">
                      <DecideDialog
                        label="Reject"
                        variant="outline"
                        icon={<X className="mr-2 h-4 w-4" />}
                        onConfirm={(remark) => {
                          reject(q.id, remark, user?.name ?? "Approver");
                          toast.success("Quotation rejected");
                        }}
                      />
                      <DecideDialog
                        label="Approve"
                        variant="default"
                        icon={<Check className="mr-2 h-4 w-4" />}
                        onConfirm={(remark) => {
                          const po = approve(q.id, remark, user?.name ?? "Approver");
                          toast.success(po ? `Approved — ${po.number} issued` : "Approved");
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </PageBody>
    </>
  );
}

function DecideDialog({
  label, icon, variant, onConfirm,
}: {
  label: string;
  icon: React.ReactNode;
  variant: "default" | "outline";
  onConfirm: (remark: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [remark, setRemark] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant}>{icon}{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{label} quotation</DialogTitle></DialogHeader>
        <Textarea placeholder="Add a remark (optional)" rows={3} value={remark} onChange={(e) => setRemark(e.target.value)} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant={variant} onClick={() => { onConfirm(remark); setOpen(false); setRemark(""); }}>{label}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}