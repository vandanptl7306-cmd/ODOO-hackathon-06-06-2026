import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useData } from "@/lib/store";
import type { VendorStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/vendors/new")({
  component: NewVendorPage,
});

function NewVendorPage() {
  const navigate = useNavigate();
  const addVendor = useData((s) => s.addVendor);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Hardware",
    gst: "",
    address: "",
    status: "active" as VendorStatus,
    rating: 4,
  });

  return (
    <>
      <PageHeader title="New vendor" description="Register a supplier to invite for RFQs." />
      <PageBody>
        <Card className="max-w-3xl">
          <CardContent className="p-6">
            <form
              className="grid gap-5 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                addVendor(form);
                toast.success("Vendor added");
                navigate({ to: "/vendors" });
              }}
            >
              <Field label="Company name">
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Contact email">
                <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Category">
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Hardware", "Logistics", "Office Supplies", "Electrical", "Raw Materials", "Software", "Services"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="GST number">
                <Input value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} placeholder="22ABCDE1234F1Z5" />
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VendorStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blacklisted">Blacklisted</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Address" className="md:col-span-2">
                <Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </Field>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate({ to: "/vendors" })}>Cancel</Button>
                <Button type="submit">Save vendor</Button>
              </div>
            </form>
          </CardContent>
        </Card>
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