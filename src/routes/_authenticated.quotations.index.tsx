import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useData, formatCurrency } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/quotations/")({
  component: VendorQuotationsPage,
});

function VendorQuotationsPage() {
  const vendors = useData((s) => s.vendors);
  const rfqs = useData((s) => s.rfqs);
  const quotations = useData((s) => s.quotations);

  // For demo, vendor user selects which vendor they "are"
  const [vendorId, setVendorId] = useState(vendors[0]?.id ?? "");
  const activeVendors = vendors.filter((v) => v.status === "active");

  const invitedRfqs = rfqs.filter((r) => r.invitedVendorIds.includes(vendorId));
  const myQuotes = quotations.filter((q) => q.vendorId === vendorId);

  return (
    <>
      <PageHeader
        title="My quotations"
        description="RFQs you've been invited to and quotes you've submitted."
        actions={
          <Select value={vendorId} onValueChange={setVendorId}>
            <SelectTrigger className="w-[240px]"><SelectValue placeholder="Select your vendor" /></SelectTrigger>
            <SelectContent>
              {activeVendors.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <PageBody>
        <Card>
          <div className="border-b px-5 py-3 text-sm font-medium">Invited RFQs</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFQ</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>My quote</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitedRfqs.map((r) => {
                const mine = myQuotes.find((q) => q.rfqId === r.id);
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.number}</div>
                    </TableCell>
                    <TableCell>{r.items.length}</TableCell>
                    <TableCell>{r.deadline}</TableCell>
                    <TableCell>{mine ? <StatusBadge status={mine.status} /> : <span className="text-xs text-muted-foreground">Not submitted</span>}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant={mine ? "outline" : "default"}>
                        <Link to="/quotations/$rfqId/submit" params={{ rfqId: r.id }} search={{ vendorId }}>
                          {mine ? "Edit quote" : "Submit quote"}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {invitedRfqs.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No invitations yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="border-b px-5 py-3 text-sm font-medium">All my submissions</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFQ</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myQuotes.map((q) => {
                const r = rfqs.find((rr) => rr.id === q.rfqId)!;
                const subtotal = q.lines.reduce((s, l) => {
                  const it = r?.items.find((i) => i.id === l.itemId);
                  return s + (it ? it.quantity * l.unitPrice : 0);
                }, 0);
                return (
                  <TableRow key={q.id}>
                    <TableCell>{r?.number}</TableCell>
                    <TableCell>{new Date(q.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{q.deliveryDays}d</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(subtotal * (1 + q.taxPercent / 100))}</TableCell>
                    <TableCell><StatusBadge status={q.status} /></TableCell>
                  </TableRow>
                );
              })}
              {myQuotes.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No quotes submitted.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}