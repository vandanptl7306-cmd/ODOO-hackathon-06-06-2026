import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader, PageBody, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/rfqs/")({
  component: RfqsPage,
});

function RfqsPage() {
  const rfqs = useData((s) => s.rfqs);
  const quotations = useData((s) => s.quotations);

  return (
    <>
      <PageHeader
        title="Requests for Quotation"
        description="Issue RFQs to invited vendors and track responses."
        actions={
          <Button asChild>
            <Link to="/rfqs/new"><Plus className="mr-2 h-4 w-4" /> New RFQ</Link>
          </Button>
        }
      />
      <PageBody>
        {rfqs.length === 0 ? (
          <EmptyState
            title="No RFQs yet"
            description="Create your first RFQ to invite vendors for pricing."
            action={<Button asChild><Link to="/rfqs/new">New RFQ</Link></Button>}
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFQ</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Vendors</TableHead>
                  <TableHead>Quotes</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfqs.map((r) => {
                  const qCount = quotations.filter((q) => q.rfqId === r.id).length;
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Link to="/rfqs/$id" params={{ id: r.id }} className="block">
                          <div className="font-medium">{r.title}</div>
                          <div className="text-xs text-muted-foreground">{r.number} {r.category ? `• ${r.category}` : ""}</div>
                        </Link>
                      </TableCell>
                      <TableCell>{r.items.length}</TableCell>
                      <TableCell>{r.invitedVendorIds.length}</TableCell>
                      <TableCell>{qCount}</TableCell>
                      <TableCell>{r.deadline}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </PageBody>
    </>
  );
}