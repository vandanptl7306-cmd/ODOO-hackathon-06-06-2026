import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, Upload } from "lucide-react";
import { PageHeader, PageBody } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useData, useAuth } from "@/lib/store";
import type { RfqStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/rfqs/new")({
  component: NewRfqPage,
});

type Line = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  specification: string;
};

function newLine(): Line {
  return {
    id: `li_${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    quantity: 1,
    unit: "NOS",
    specification: "",
  };
}

function NewRfqPage() {
  const navigate = useNavigate();
  const vendors = useData((s) => s.vendors.filter((v) => v.status === "active"));
  const addRfq = useData((s) => s.addRfq);
  const user = useAuth((s) => s.user);

  // Default wireframe states
  const [title, setTitle] = useState("Office Furniture procurement Q2");
  const [category, setCategory] = useState("Furniture");
  const [deadline, setDeadline] = useState("2025-06-15");
  const [description, setDescription] = useState(
    "Ergonomic chairs and standing desks for 3rd floor"
  );

  // Line items prepopulated with wireframe examples
  const [items, setItems] = useState<Line[]>([
    {
      id: "li_1",
      name: "Ergonomic chair",
      quantity: 25,
      unit: "NOS",
      specification: "High back mesh, adjustable armrest",
    },
    {
      id: "li_2",
      name: "Standing desks",
      quantity: 10,
      unit: "NOS",
      specification: "Dual motor, height adjustable",
    },
  ]);

  // Prepopulate invited vendors (v1: Infra Supplies, v2: Tech Core)
  const [invited, setInvited] = useState<string[]>(
    vendors.filter((v) => v.id === "v1" || v.id === "v2").map((v) => v.id)
  );

  const toggleVendor = (id: string) => {
    setInvited((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleAddItem = () => {
    setItems([...items, newLine()]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof Line,
    value: string | number
  ) => {
    setItems(
      items.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const handleSave = (status: RfqStatus) => {
    if (!title.trim()) {
      toast.error("Please provide an RFQ title.");
      return;
    }
    if (items.some((it) => !it.name.trim())) {
      toast.error("Please fill in names for all line items.");
      return;
    }
    if (invited.length === 0) {
      toast.error("Please invite at least one vendor.");
      return;
    }

    const rfq = addRfq({
      title,
      description,
      deadline,
      items,
      invitedVendorIds: invited,
      createdBy: user?.name || "Procurement Officer",
      status,
    });

    toast.success(
      status === "draft"
        ? `RFQ ${rfq.number} saved as draft.`
        : `RFQ ${rfq.number} sent to vendors.`
    );
    navigate({ to: "/rfqs" });
  };

  return (
    <>
      <PageHeader title="Create RFQ's" description="new request for quotation" />
      <PageBody>
        {/* Visual Stepper Section matching wireframe */}
        <div className="max-w-5xl mx-auto mb-8 px-6">
          <div className="relative flex items-center justify-between w-full">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
            
            {/* Step 1: Active */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[oklch(0.55_0.13_245)] text-white font-bold text-sm shadow-md ring-4 ring-[oklch(0.55_0.13_245)]/20 select-none">
                1
              </div>
            </div>

            {/* Step 2: Inactive */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white border-2 border-border text-muted-foreground font-semibold text-sm select-none">
                2
              </div>
            </div>

            {/* Step 3: Inactive */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white border-2 border-border text-muted-foreground font-semibold text-sm select-none">
                3
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column split form */}
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto items-start">
          
          {/* LEFT COLUMN: RFQ Details */}
          <Card className="border border-border/60 shadow-sm bg-white">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold text-sm">
                  RFQ's title*
                </Label>
                <Input
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Office laptops Q3"
                  className="h-10 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-semibold text-sm">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="h-10 bg-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Furniture",
                      "Hardware",
                      "IT",
                      "Logistics",
                      "Electrical",
                      "Raw Materials",
                      "Software",
                      "Services",
                    ].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="font-semibold text-sm">
                  Deadline*
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="h-10 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about this RFQ..."
                  className="bg-white resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* RIGHT COLUMN: Line Items & Vendor Assigner */}
          <div className="space-y-6">
            
            {/* Line Items Card */}
            <Card className="border border-border/60 shadow-sm bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-semibold text-sm text-[oklch(0.25_0.08_260)]">
                    Line items
                  </span>
                </div>

                <div className="border rounded-md overflow-hidden bg-muted/10">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="h-8">
                        <TableHead className="h-8 py-1 text-xs">item</TableHead>
                        <TableHead className="h-8 py-1 text-xs w-20">qty</TableHead>
                        <TableHead className="h-8 py-1 text-xs w-20">Unit</TableHead>
                        <TableHead className="h-8 py-1 text-xs w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((it, index) => (
                        <TableRow key={it.id} className="h-10 hover:bg-transparent">
                          <TableCell className="p-1">
                            <Input
                              required
                              value={it.name}
                              onChange={(e) =>
                                handleItemChange(index, "name", e.target.value)
                              }
                              placeholder="Item name"
                              className="border-0 shadow-none focus-visible:ring-0 h-8 px-2 bg-transparent font-medium"
                            />
                          </TableCell>
                          <TableCell className="p-1">
                            <Input
                              type="number"
                              min={1}
                              required
                              value={it.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  +e.target.value
                                )
                              }
                              className="border-0 shadow-none focus-visible:ring-0 h-8 px-2 bg-transparent font-mono text-xs w-16"
                            />
                          </TableCell>
                          <TableCell className="p-1">
                            <Input
                              required
                              value={it.unit}
                              onChange={(e) =>
                                handleItemChange(index, "unit", e.target.value)
                              }
                              placeholder="e.g. NOS"
                              className="border-0 shadow-none focus-visible:ring-0 h-8 px-2 bg-transparent text-xs w-16"
                            />
                          </TableCell>
                          <TableCell className="p-1 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-destructive hover:bg-destructive/15 rounded p-1 transition-colors duration-150"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="font-semibold text-xs text-accent hover:bg-accent/5 select-none"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> + add line item
                </Button>
              </CardContent>
            </Card>

            {/* Assign Vendors Card */}
            <Card className="border border-border/60 shadow-sm bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    ASSIGN VENDORS
                  </span>
                </div>

                {/* Assigned Vendors List */}
                <div className="space-y-2">
                  {invited.map((vid) => {
                    const v = vendors.find((vend) => vend.id === vid);
                    if (!v) return null;
                    return (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-md border bg-muted/10 px-3 py-2 text-sm font-medium"
                      >
                        <div>
                          <div className="font-semibold text-[oklch(0.25_0.08_260)]">
                            {v.name}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {v.category}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleVendor(v.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-muted p-1 rounded transition-colors duration-150"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                  {invited.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2">
                      No vendors assigned yet.
                    </p>
                  )}
                </div>

                {/* Select dropdown to add a vendor */}
                <Select
                  onValueChange={(val) => {
                    if (val && !invited.includes(val)) {
                      setInvited([...invited, val]);
                    }
                  }}
                  value=""
                >
                  <SelectTrigger className="w-full h-10 bg-white font-semibold text-xs border-dashed text-muted-foreground hover:bg-muted/30">
                    <SelectValue placeholder="+ add vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors
                      .filter((v) => !invited.includes(v.id))
                      .map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} ({v.category})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Separator line */}
        <hr className="my-8 border-border max-w-5xl mx-auto" />

        {/* Bottom attachments and actions */}
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto items-start pb-10">
          
          {/* Actions Left */}
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              onClick={() => handleSave("open")}
              className="h-11 font-semibold select-none shadow-sm cursor-pointer"
            >
              Save & Send to Vendors
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave("draft")}
              className="h-11 font-semibold select-none border-border hover:bg-muted/50 cursor-pointer"
            >
              Save as Draft
            </Button>
          </div>

          {/* Attachments Right */}
          <div className="space-y-2">
            <Label className="font-semibold text-sm text-muted-foreground">
              Attchements
            </Label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 bg-white rounded-lg p-6 hover:border-primary/50 cursor-pointer transition-colors duration-200">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-xs font-medium text-muted-foreground">
                Drag & drop files or click to upload
              </span>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}