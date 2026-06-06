import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, Star } from "lucide-react";
import { PageHeader, PageBody, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/vendors/")({
  component: VendorsPage,
});

function VendorsPage() {
  const vendors = useData((s) => s.vendors);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(
    () =>
      vendors.filter((v) => {
        if (status !== "all" && v.status !== status) return false;
        if (q && !`${v.name} ${v.email} ${v.category}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [vendors, q, status],
  );

  return (
    <>
      <PageHeader
        title="Vendors"
        description="Manage suppliers, categories, and compliance details."
        actions={
          <Button asChild>
            <Link to="/vendors/new"><Plus className="mr-2 h-4 w-4" /> New vendor</Link>
          </Button>
        }
      />
      <PageBody>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, category" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blacklisted">Blacklisted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No vendors match" description="Try adjusting filters or add a new vendor." />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id} className="cursor-pointer">
                    <TableCell>
                      <Link to="/vendors/$id" params={{ id: v.id }} className="block">
                        <div className="font-medium">{v.name}</div>
                        <div className="text-xs text-muted-foreground">{v.email}</div>
                      </Link>
                    </TableCell>
                    <TableCell>{v.category}</TableCell>
                    <TableCell className="font-mono text-xs">{v.gst}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        {v.rating.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell><StatusBadge status={v.status} /></TableCell>
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