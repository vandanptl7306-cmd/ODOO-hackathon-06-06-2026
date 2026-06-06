import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { useData } from "@/lib/store";
import type { VendorStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/vendors/$id")({
  component: VendorDetailPage,
});

function VendorDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const vendor = useData((s) => s.vendors.find((v) => v.id === id));
  const updateVendor = useData((s) => s.updateVendor);
  const deleteVendor = useData((s) => s.deleteVendor);
  const allQuotations = useData((s) => s.quotations);
  const quotations = useMemo(() => allQuotations.filter((q) => q.vendorId === id), [allQuotations, id]);
  const [form, setForm] = useState(vendor);

  if (!vendor || !form) {
    return (
      <PageBody>
        <p className="text-sm text-muted-foreground">Vendor not found.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/vendors">Back to vendors</Link></Button>
      </PageBody>
    );
  }

  return (
    <>
      <PageHeader
        title={vendor.name}
        description={`${vendor.category} • Added ${vendor.createdAt}`}
        actions={
          <>
            <Button asChild variant="outline"><Link to="/vendors"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link></Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteVendor(vendor.id);
                toast.success("Vendor deleted");
                navigate({ to: "/vendors" });
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Vendor details</CardTitle></CardHeader>
            <CardContent>
              <form
                className="grid gap-5 md:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateVendor(vendor.id, form);
                  toast.success("Vendor updated");
                }}
              >
                <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
                <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
                <Field label="GST"><Input value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} /></Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VendorStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Address" className="md:col-span-2">
                  <Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </Field>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={vendor.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rating</span>
                <span>{vendor.rating.toFixed(1)} / 5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Quotations</span>
                <span>{quotations.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}