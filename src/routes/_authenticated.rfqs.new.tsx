import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useData, useAuth } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/rfqs/new")({
  component: NewRfqPage,
});

type Line = { id: string; name: string; quantity: number; unit: string; specification: string };

function newLine(): Line {
  return { id: `li_${Math.random().toString(36).slice(2, 7)}`, name: "", quantity: 1, unit: "pcs", specification: "" };
}

function NewRfqPage() {
  const navigate = useNavigate();
  const vendors = useData((s) => s.vendors.filter((v) => v.status === "active"));
  const addRfq = useData((s) => s.addRfq);
  const user = useAuth((s) => s.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10));
  const [items, setItems] = useState<Line[]>([newLine()]);
  const [invited, setInvited] = useState<string[]>([]);

  const toggleVendor = (id: string) =>
    setInvited((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));

  return (
    <>
      <PageHeader title="New RFQ" description="Define what you need and invite vendors to quote." />
      <PageBody>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (invited.length === 0) return toast.error("Invite at least one vendor.");
            const rfq = addRfq({
              title,
              description,
              deadline,
              items,
              invitedVendorIds: invited,
              createdBy: user?.name ?? "Procurement Officer",
            });
            toast.success(`Created ${rfq.number}`);
            navigate({ to: "/rfqs/$id", params: { id: rfq.id } });
          }}
        >
          <Card className="max-w-4xl">
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Title</Label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Office laptops Q3" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="max-w-4xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, newLine()])}>
                <Plus className="mr-2 h-4 w-4" /> Add item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((it, i) => (
                <div key={it.id} className="grid gap-3 md:grid-cols-12 items-end border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="md:col-span-5 space-y-1">
                    <Label className="text-xs">Item name</Label>
                    <Input required value={it.name} onChange={(e) => setItems(items.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" min={1} value={it.quantity} onChange={(e) => setItems(items.map((x, idx) => idx === i ? { ...x, quantity: +e.target.value } : x))} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <Input value={it.unit} onChange={(e) => setItems(items.map((x, idx) => idx === i ? { ...x, unit: e.target.value } : x))} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs">Spec</Label>
                    <Input value={it.specification} onChange={(e) => setItems(items.map((x, idx) => idx === i ? { ...x, specification: e.target.value } : x))} />
                  </div>
                  <div className="md:col-span-1">
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="max-w-4xl">
            <CardHeader><CardTitle>Invite vendors</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {vendors.map((v) => (
                  <label key={v.id} className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/40 cursor-pointer">
                    <Checkbox checked={invited.includes(v.id)} onCheckedChange={() => toggleVendor(v.id)} />
                    <div>
                      <div className="text-sm font-medium">{v.name}</div>
                      <div className="text-xs text-muted-foreground">{v.category}</div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 max-w-4xl">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/rfqs" })}>Cancel</Button>
            <Button type="submit">Create RFQ</Button>
          </div>
        </form>
      </PageBody>
    </>
  );
}