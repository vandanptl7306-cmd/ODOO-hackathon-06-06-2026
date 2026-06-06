import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageBody, EmptyState } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { useData, formatCurrency } from "@/lib/store";
import { PurchaseOrderDetailView } from "./_authenticated.purchase-orders.$id";

export const Route = createFileRoute("/_authenticated/purchase-orders/")({
  component: POListPage,
});

function POListPage() {
  const pos = useData((s) => s.pos);
  const vendors = useData((s) => s.vendors);
  const rfqs = useData((s) => s.rfqs);

  // Check if we are viewing the invoices list
  const isInvoiceMode = typeof window !== "undefined" && window.location.search.includes("type=invoices");

  if (isInvoiceMode) {
    const po1 = pos.find((p) => p.id === "po1");
    return (
      <PageBody>
        {po1 ? (
          <PurchaseOrderDetailView poId="po1" />
        ) : (
          <EmptyState 
            title="No invoices" 
            description="Invoices will appear once a purchase order is generated." 
          />
        )}
      </PageBody>
    );
  }

  const titleText = "Purchase Orders";
  const descText = "Auto-generated from approved quotations.";

  return (
    <>
      <PageHeader title={titleText} description={descText} />
      <PageBody>
        {pos.length === 0 ? (
          <EmptyState 
            title={isInvoiceMode ? "No invoices" : "No purchase orders"} 
            description={isInvoiceMode 
              ? "Invoices will appear once a purchase order is generated." 
              : "Approve a quotation in Approvals to generate the first PO."
            } 
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isInvoiceMode ? "Invoice Number" : "PO Number"}</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>RFQ</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link to="/purchase-orders/$id" params={{ id: p.id }} className="font-medium hover:underline">{p.number}</Link>
                    </TableCell>
                    <TableCell>{vendors.find((v) => v.id === p.vendorId)?.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{rfqs.find((r) => r.id === p.rfqId)?.number}</TableCell>
                    <TableCell>{p.createdAt}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(p.total)}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </PageBody>
    </>
  );
}