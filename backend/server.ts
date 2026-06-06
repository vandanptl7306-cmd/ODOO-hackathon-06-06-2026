import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "database.json");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- TYPES ---
export type Role = "officer" | "vendor" | "approver" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type VendorStatus = "active" | "inactive" | "blacklisted";

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  gst: string;
  address: string;
  status: VendorStatus;
  rating: number;
  createdAt: string;
}

export interface RfqLineItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  specification: string;
}

export type RfqStatus = "draft" | "open" | "closed" | "awarded";

export interface Rfq {
  id: string;
  number: string;
  title: string;
  description: string;
  items: RfqLineItem[];
  deadline: string;
  invitedVendorIds: string[];
  status: RfqStatus;
  createdBy: string;
  createdAt: string;
}

export type QuotationStatus = "submitted" | "approved" | "rejected";

export interface QuotationLine {
  itemId: string;
  unitPrice: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  lines: QuotationLine[];
  deliveryDays: number;
  taxPercent: number;
  notes: string;
  status: QuotationStatus;
  approvalRemark?: string;
  submittedAt: string;
}

export type POStatus = "issued" | "in_progress" | "completed" | "cancelled";

export interface PurchaseOrder {
  id: string;
  number: string;
  rfqId: string;
  quotationId: string;
  vendorId: string;
  subtotal: number;
  tax: number;
  total: number;
  status: POStatus;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
  refType?: "rfq" | "quotation" | "po" | "vendor";
  refId?: string;
}

interface DBState {
  users: User[];
  vendors: Vendor[];
  rfqs: Rfq[];
  quotations: Quotation[];
  pos: PurchaseOrder[];
  activity: ActivityEntry[];
}

// --- SEED DATA ---
const seedUsers: User[] = [
  { id: "u1", name: "Sarah Connor", email: "officer@vendorbridge.test", role: "officer" },
  { id: "u2", name: "John Doe", email: "vendor@vendorbridge.test", role: "vendor" },
  { id: "u3", name: "Alice Smith", email: "manager@vendorbridge.test", role: "approver" },
  { id: "u4", name: "Bob Johnson", email: "admin@vendorbridge.test", role: "admin" },
];

const seedVendors: Vendor[] = [
  { id: "v1", name: "Acme Industrial Supplies", email: "sales@acme.test", phone: "+91 98765 43210", category: "Hardware", gst: "29ABCDE1234F1Z5", address: "Bengaluru, KA", status: "active", rating: 4.6, createdAt: "2025-01-12" },
  { id: "v2", name: "Northwind Logistics", email: "hello@northwind.test", phone: "+91 99876 54321", category: "Logistics", gst: "27FGHIJ5678K2Z9", address: "Mumbai, MH", status: "active", rating: 4.2, createdAt: "2025-02-04" },
  { id: "v3", name: "Globex Office Goods", email: "team@globex.test", phone: "+91 91234 56789", category: "Office Supplies", gst: "07KLMNO9012P3Z1", address: "Delhi, DL", status: "active", rating: 3.9, createdAt: "2025-03-20" },
  { id: "v4", name: "Initech Electricals", email: "info@initech.test", phone: "+91 90011 22334", category: "Electrical", gst: "33QRSTU3456V4Z7", address: "Chennai, TN", status: "inactive", rating: 3.4, createdAt: "2025-04-15" },
  { id: "v5", name: "Soylent Materials", email: "ops@soylent.test", phone: "+91 90022 33445", category: "Raw Materials", gst: "24WXYZA7890B5Z3", address: "Ahmedabad, GJ", status: "blacklisted", rating: 2.1, createdAt: "2024-11-09" },
];

const seedRfqs: Rfq[] = [
  {
    id: "r1",
    number: "RFQ-2026-0001",
    title: "Office laptops Q2",
    description: "Replacement laptops for engineering team",
    items: [
      { id: "li1", name: "Laptop 14\" 16GB/512GB", quantity: 25, unit: "pcs", specification: "Intel i7, Windows 11 Pro" },
      { id: "li2", name: "USB-C dock", quantity: 25, unit: "pcs", specification: "Dual 4K output" },
    ],
    deadline: "2026-06-30",
    invitedVendorIds: ["v1", "v3"],
    status: "open",
    createdBy: "Procurement Officer",
    createdAt: "2026-06-01",
  },
  {
    id: "r2",
    number: "RFQ-2026-0002",
    title: "Warehouse pallet racks",
    description: "Heavy-duty pallet racking for new warehouse",
    items: [
      { id: "li3", name: "Pallet rack bay 3m", quantity: 40, unit: "bays", specification: "1000kg per shelf" },
    ],
    deadline: "2026-06-20",
    invitedVendorIds: ["v1", "v2"],
    status: "open",
    createdBy: "Procurement Officer",
    createdAt: "2026-05-25",
  },
];

const seedQuotations: Quotation[] = [
  { id: "q1", rfqId: "r1", vendorId: "v1", lines: [{ itemId: "li1", unitPrice: 78000 }, { itemId: "li2", unitPrice: 6500 }], deliveryDays: 14, taxPercent: 18, notes: "Bulk discount applied.", status: "submitted", submittedAt: "2026-06-03" },
  { id: "q2", rfqId: "r1", vendorId: "v3", lines: [{ itemId: "li1", unitPrice: 82000 }, { itemId: "li2", unitPrice: 5800 }], deliveryDays: 10, taxPercent: 18, notes: "Free onsite setup.", status: "submitted", submittedAt: "2026-06-04" },
  { id: "q3", rfqId: "r2", vendorId: "v2", lines: [{ itemId: "li3", unitPrice: 14500 }], deliveryDays: 21, taxPercent: 18, notes: "Installation included.", status: "submitted", submittedAt: "2026-06-02" },
];

const seedActivity: ActivityEntry[] = [
  { id: "a1", at: "2026-06-01T09:00:00Z", actor: "Procurement Officer", action: "RFQ created", detail: "RFQ-2026-0001 — Office laptops Q2", refType: "rfq", refId: "r1" },
  { id: "a2", at: "2026-06-03T11:30:00Z", actor: "Acme Industrial Supplies", action: "Quotation submitted", detail: "Quote for RFQ-2026-0001", refType: "quotation", refId: "q1" },
  { id: "a3", at: "2026-06-04T14:15:00Z", actor: "Globex Office Goods", action: "Quotation submitted", detail: "Quote for RFQ-2026-0001", refType: "quotation", refId: "q2" },
];

// --- DATABASE CLASS ---
class JSONDatabase {
  private data: DBState = {
    users: [],
    vendors: [],
    rfqs: [],
    quotations: [],
    pos: [],
    activity: [],
  };

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error("Error loading database file, re-initializing:", err);
        this.initDefault();
      }
    } else {
      this.initDefault();
    }
  }

  private initDefault() {
    this.data = {
      users: seedUsers,
      vendors: seedVendors,
      rfqs: seedRfqs,
      quotations: seedQuotations,
      pos: [],
      activity: seedActivity,
    };
    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write to database file:", err);
    }
  }

  // Helper helpers
  public uid(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
  }

  public nextNumber(prefix: string, listLength: number): string {
    const d = new Date();
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    return `${prefix}-${ym}-${String(listLength + 1).padStart(4, "0")}`;
  }

  // Getters
  public getUsers() { return this.data.users; }
  public getVendors() { return this.data.vendors; }
  public getRfqs() { return this.data.rfqs; }
  public getQuotations() { return this.data.quotations; }
  public getPOs() { return this.data.pos; }
  public getActivity() { return this.data.activity; }

  // Setters/CRUD actions
  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  public addVendor(v: Omit<Vendor, "id" | "createdAt" | "rating">) {
    const vendor: Vendor = {
      ...v,
      id: this.uid("v"),
      rating: 5.0, // initial rating
      createdAt: new Date().toISOString().slice(0, 10),
    };
    this.data.vendors.unshift(vendor);
    this.log({
      actor: "Admin",
      action: "Vendor added",
      detail: vendor.name,
      refType: "vendor",
      refId: vendor.id,
    });
    this.save();
    return vendor;
  }

  public updateVendor(id: string, patch: Partial<Vendor>) {
    this.data.vendors = this.data.vendors.map((v) =>
      v.id === id ? { ...v, ...patch } : v
    );
    this.save();
  }

  public deleteVendor(id: string) {
    this.data.vendors = this.data.vendors.filter((v) => v.id !== id);
    this.save();
  }

  public addRfq(r: Omit<Rfq, "id" | "number" | "createdAt" | "status">) {
    const rfq: Rfq = {
      ...r,
      id: this.uid("r"),
      number: this.nextNumber("RFQ", this.data.rfqs.length),
      createdAt: new Date().toISOString().slice(0, 10),
      status: "open",
    };
    this.data.rfqs.unshift(rfq);
    this.log({
      actor: r.createdBy,
      action: "RFQ created",
      detail: `${rfq.number} — ${rfq.title}`,
      refType: "rfq",
      refId: rfq.id,
    });
    this.save();
    return rfq;
  }

  public updateRfq(id: string, patch: Partial<Rfq>) {
    this.data.rfqs = this.data.rfqs.map((r) =>
      r.id === id ? { ...r, ...patch } : r
    );
    this.save();
  }

  public addQuotation(q: Omit<Quotation, "id" | "submittedAt" | "status">) {
    const quotation: Quotation = {
      ...q,
      id: this.uid("q"),
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };
    this.data.quotations.unshift(quotation);

    const vendor = this.data.vendors.find((v) => v.id === q.vendorId);
    const rfq = this.data.rfqs.find((r) => r.id === q.rfqId);

    this.log({
      actor: vendor?.name || "Vendor",
      action: "Quotation submitted",
      detail: `Quote for ${rfq?.number ?? q.rfqId}`,
      refType: "quotation",
      refId: quotation.id,
    });
    this.save();
    return quotation;
  }

  public updateQuotation(id: string, patch: Partial<Quotation>) {
    this.data.quotations = this.data.quotations.map((q) =>
      q.id === id ? { ...q, ...patch } : q
    );
    this.save();
  }

  public approveQuotation(id: string, remark: string, approver: string): PurchaseOrder | null {
    const q = this.data.quotations.find((x) => x.id === id);
    if (!q) return null;

    const rfq = this.data.rfqs.find((r) => r.id === q.rfqId);
    if (!rfq) return null;

    // Calculate PO values
    const subtotal = q.lines.reduce((sum, line) => {
      const item = rfq.items.find((i) => i.id === line.itemId);
      return sum + (item ? item.quantity * line.unitPrice : 0);
    }, 0);
    const tax = +(subtotal * (q.taxPercent / 100)).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    const po: PurchaseOrder = {
      id: this.uid("po"),
      number: this.nextNumber("PO", this.data.pos.length),
      rfqId: q.rfqId,
      quotationId: q.id,
      vendorId: q.vendorId,
      subtotal,
      tax,
      total,
      status: "issued",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    // Update statuses across tables
    this.data.quotations = this.data.quotations.map((x) =>
      x.id === id
        ? { ...x, status: "approved", approvalRemark: remark }
        : x.rfqId === q.rfqId && x.status === "submitted"
          ? { ...x, status: "rejected", approvalRemark: "Another quotation was approved" }
          : x
    );

    this.data.rfqs = this.data.rfqs.map((r) =>
      r.id === q.rfqId ? { ...r, status: "awarded" as RfqStatus } : r
    );

    this.data.pos.unshift(po);

    this.log({
      actor: approver,
      action: "Quotation approved",
      detail: `${rfq.number} → PO ${po.number}`,
      refType: "po",
      refId: po.id,
    });

    this.save();
    return po;
  }

  public rejectQuotation(id: string, remark: string, approver: string) {
    const q = this.data.quotations.find((x) => x.id === id);
    if (!q) return;

    this.data.quotations = this.data.quotations.map((x) =>
      x.id === id ? { ...x, status: "rejected", approvalRemark: remark } : x
    );

    const rfq = this.data.rfqs.find((r) => r.id === q.rfqId);
    this.log({
      actor: approver,
      action: "Quotation rejected",
      detail: `${rfq?.number ?? ""} — ${remark}`,
      refType: "quotation",
      refId: id,
    });

    this.save();
  }

  public updatePO(id: string, patch: Partial<PurchaseOrder>) {
    this.data.pos = this.data.pos.map((p) =>
      p.id === id ? { ...p, ...patch } : p
    );
    this.save();
  }

  public log(entry: Omit<ActivityEntry, "id" | "at">) {
    const logEntry: ActivityEntry = {
      ...entry,
      id: this.uid("a"),
      at: new Date().toISOString(),
    };
    this.data.activity.unshift(logEntry);
    this.data.activity = this.data.activity.slice(0, 200); // Keep last 200 logs
    this.save();
  }

  public reset() {
    this.initDefault();
  }
}

const db = new JSONDatabase();

// --- ZOD REQUEST SCHEMAS ---
const LoginSchema = z.object({
  email: z.string().email(),
});

const SignupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["officer", "vendor", "approver", "admin"]),
});

const VendorCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  category: z.string().min(1),
  gst: z.string().min(1),
  address: z.string().min(1),
  status: z.enum(["active", "inactive", "blacklisted"]),
});

const RfqCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  deadline: z.string(),
  invitedVendorIds: z.array(z.string()),
  createdBy: z.string(),
  items: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.number().positive(),
      unit: z.string().min(1),
      specification: z.string(),
    })
  ),
});

const QuotationCreateSchema = z.object({
  rfqId: z.string(),
  vendorId: z.string(),
  deliveryDays: z.number().positive(),
  taxPercent: z.number().nonnegative(),
  notes: z.string(),
  lines: z.array(
    z.object({
      itemId: z.string(),
      unitPrice: z.number().positive(),
    })
  ),
});

const ApproveRejectSchema = z.object({
  remark: z.string(),
  approver: z.string(),
});

const POSchema = z.object({
  status: z.enum(["issued", "in_progress", "completed", "cancelled"]),
});

// --- API ROUTES ---

// Auth Routes
app.post("/api/auth/login", (req, res) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const { email } = parse.data;
  let user = db.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Dynamically sign up for the demo/mock context
    user = {
      id: db.uid("u"),
      name: email.split("@")[0],
      email: email.toLowerCase(),
      role: "officer",
    };
    db.addUser(user);
  }

  res.json({ user });
});

app.post("/api/auth/signup", (req, res) => {
  const parse = SignupSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const { email, name, role } = parse.data;
  const exists = db.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return res.status(400).json({ error: "User already exists" });

  const user: User = {
    id: db.uid("u"),
    name,
    email: email.toLowerCase(),
    role,
  };
  db.addUser(user);

  res.json({ user });
});

// Vendor Routes
app.get("/api/vendors", (req, res) => {
  res.json(db.getVendors());
});

app.post("/api/vendors", (req, res) => {
  const parse = VendorCreateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const vendor = db.addVendor(parse.data);
  res.status(201).json(vendor);
});

app.put("/api/vendors/:id", (req, res) => {
  const parse = VendorCreateSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  db.updateVendor(req.params.id, parse.data);
  res.json({ success: true });
});

app.delete("/api/vendors/:id", (req, res) => {
  db.deleteVendor(req.params.id);
  res.json({ success: true });
});

// RFQ Routes
app.get("/api/rfqs", (req, res) => {
  res.json(db.getRfqs());
});

app.post("/api/rfqs", (req, res) => {
  const parse = RfqCreateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  // Map items to include a unique ID
  const itemsWithIds = parse.data.items.map((item) => ({
    ...item,
    id: db.uid("li"),
  }));

  const rfq = db.addRfq({
    ...parse.data,
    items: itemsWithIds,
  });

  res.status(201).json(rfq);
});

app.put("/api/rfqs/:id", (req, res) => {
  const patchSchema = z.object({
    status: z.enum(["draft", "open", "closed", "awarded"]),
  }).partial();

  const parse = patchSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  db.updateRfq(req.params.id, parse.data);
  res.json({ success: true });
});

// Quotation Routes
app.get("/api/quotations", (req, res) => {
  res.json(db.getQuotations());
});

app.post("/api/quotations", (req, res) => {
  const parse = QuotationCreateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const quote = db.addQuotation(parse.data);
  res.status(201).json(quote);
});

app.put("/api/quotations/:id", (req, res) => {
  const parse = QuotationCreateSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  db.updateQuotation(req.params.id, parse.data);
  res.json({ success: true });
});

app.post("/api/quotations/:id/approve", (req, res) => {
  const parse = ApproveRejectSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const { remark, approver } = parse.data;
  const po = db.approveQuotation(req.params.id, remark, approver);

  if (!po) return res.status(404).json({ error: "Quotation or RFQ not found" });
  res.json({ success: true, po });
});

app.post("/api/quotations/:id/reject", (req, res) => {
  const parse = ApproveRejectSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const { remark, approver } = parse.data;
  db.rejectQuotation(req.params.id, remark, approver);
  res.json({ success: true });
});

// PO Routes
app.get("/api/pos", (req, res) => {
  res.json(db.getPOs());
});

app.put("/api/pos/:id", (req, res) => {
  const parse = POSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  db.updatePO(req.params.id, parse.data);
  res.json({ success: true });
});

// Activity Routes
app.get("/api/activity", (req, res) => {
  res.json(db.getActivity());
});

app.post("/api/activity", (req, res) => {
  const parse = z.object({
    actor: z.string(),
    action: z.string(),
    detail: z.string(),
    refType: z.enum(["rfq", "quotation", "po", "vendor"]).optional(),
    refId: z.string().optional(),
  }).safeParse(req.body);

  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  db.log(parse.data);
  res.status(201).json({ success: true });
});

// Reports Endpoints
app.get("/api/reports/spend", (req, res) => {
  const pos = db.getPOs();
  const vendors = db.getVendors();
  const rfqs = db.getRfqs();

  // Spend by vendor
  const spendByVendorMap: { [key: string]: number } = {};
  pos.forEach((po) => {
    const v = vendors.find((vendor) => vendor.id === po.vendorId);
    const name = v ? v.name : "Unknown Vendor";
    spendByVendorMap[name] = (spendByVendorMap[name] || 0) + po.total;
  });
  const spendByVendor = Object.entries(spendByVendorMap).map(([name, spend]) => ({
    name,
    spend,
  }));

  // Spend monthly trend
  const spendMonthlyMap: { [key: string]: number } = {};
  pos.forEach((po) => {
    // po.createdAt is YYYY-MM-DD
    const month = po.createdAt.slice(0, 7); // YYYY-MM
    spendMonthlyMap[month] = (spendMonthlyMap[month] || 0) + po.total;
  });
  const spendMonthly = Object.entries(spendMonthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, spend]) => ({
      month,
      spend,
    }));

  // Spend by category
  const spendByCategoryMap: { [key: string]: number } = {};
  pos.forEach((po) => {
    const v = vendors.find((vendor) => vendor.id === po.vendorId);
    const category = v ? v.category : "Uncategorized";
    spendByCategoryMap[category] = (spendByCategoryMap[category] || 0) + po.total;
  });
  const spendByCategory = Object.entries(spendByCategoryMap).map(([category, spend]) => ({
    name: category,
    value: spend,
  }));

  // General KPIs
  const totalSpend = pos.reduce((sum, p) => sum + p.total, 0);
  const activeRfqsCount = rfqs.filter((r) => r.status === "open").length;
  const activeVendorsCount = vendors.filter((v) => v.status === "active").length;
  const totalPoCount = pos.length;

  res.json({
    kpis: {
      totalSpend,
      activeRfqsCount,
      activeVendorsCount,
      totalPoCount,
    },
    spendByVendor,
    spendMonthly,
    spendByCategory,
  });
});

// Admin Reset
app.post("/api/admin/reset", (req, res) => {
  db.reset();
  res.json({ success: true, message: "Database re-seeded successfully" });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Standalone Backend running on http://localhost:${PORT}`);
});
