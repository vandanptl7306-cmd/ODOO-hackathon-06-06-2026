import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader, PageBody, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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
        if (
          q &&
          !`${v.name} ${v.gst} ${v.category}`
            .toLowerCase()
            .includes(q.toLowerCase())
        )
          return false;
        return true;
      }),
    [vendors, q, status],
  );

  // Dynamic counts for pill tabs
  const allCount = vendors.length;
  const activeCount = vendors.filter((v) => v.status === "active").length;
  const pendingCount = vendors.filter((v) => v.status === "pending").length;
  const blockedCount = vendors.filter((v) => v.status === "blocked").length;

  return (
    <>
      <PageHeader
        title="Vendors"
        description="Manage supplier profiles and registrations"
        actions={
          <Button asChild className="font-semibold select-none">
            <Link to="/vendors/new">
              <Plus className="mr-2 h-4 w-4" /> + Add Vendor
            </Link>
          </Button>
        }
      />
      <PageBody>
        {/* Search bar matching wireframe */}
        <div className="relative w-full max-w-3xl mb-4">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search bar ...... search by name, gst number, category..."
            className="pl-9 h-11 bg-white border border-border focus:ring-[oklch(0.55_0.13_245)]"
          />
        </div>

        {/* Custom Pill tabs matching wireframe */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setStatus("all")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer select-none ${
              status === "all"
                ? "bg-[oklch(0.93_0.05_160)] text-[oklch(0.2_0.06_160)] border-[oklch(0.8_0.05_160)]"
                : "bg-white text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            All ({allCount})
          </button>
          <button
            onClick={() => setStatus("active")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer select-none ${
              status === "active"
                ? "bg-[oklch(0.93_0.05_160)] text-[oklch(0.2_0.06_160)] border-[oklch(0.8_0.05_160)]"
                : "bg-white text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            active ({activeCount})
          </button>
          <button
            onClick={() => setStatus("pending")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer select-none ${
              status === "pending"
                ? "bg-[oklch(0.93_0.05_160)] text-[oklch(0.2_0.06_160)] border-[oklch(0.8_0.05_160)]"
                : "bg-white text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatus("blocked")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer select-none ${
              status === "blocked"
                ? "bg-[oklch(0.93_0.05_160)] text-[oklch(0.2_0.06_160)] border-[oklch(0.8_0.05_160)]"
                : "bg-white text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            Blocked ({blockedCount})
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No vendors match"
            description="Try adjusting filters or add a new vendor."
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>GST no.</TableHead>
                  <TableHead>contact no.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">
                      <div className="font-semibold text-[oklch(0.25_0.08_260)] hover:underline">
                        <Link to="/vendors/$id" params={{ id: v.id }}>
                          {v.name}
                        </Link>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {v.email}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{v.category}</TableCell>
                    <TableCell className="font-mono text-xs">{v.gst}</TableCell>
                    <TableCell>{v.phone}</TableCell>
                    <TableCell>
                      <StatusBadge status={v.status} />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button asChild size="sm" variant="outline" className="h-8 w-20 font-semibold shadow-sm hover:bg-accent/10 border-border select-none">
                        <Link to="/vendors/$id" params={{ id: v.id }}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
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