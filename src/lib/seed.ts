import type { Vendor, Rfq, Quotation, PurchaseOrder, ActivityEntry } from "./types";

export const seedVendors: Vendor[] = [
  { id: "v1", name: "Acme Industrial Supplies", email: "sales@acme.test", phone: "+91 98765 43210", category: "Hardware", gst: "29ABCDE1234F1Z5", address: "Bengaluru, KA", status: "active", rating: 4.6, createdAt: "2025-01-12" },
  { id: "v2", name: "Northwind Logistics", email: "hello@northwind.test", phone: "+91 99876 54321", category: "Logistics", gst: "27FGHIJ5678K2Z9", address: "Mumbai, MH", status: "active", rating: 4.2, createdAt: "2025-02-04" },
  { id: "v3", name: "Globex Office Goods", email: "team@globex.test", phone: "+91 91234 56789", category: "Office Supplies", gst: "07KLMNO9012P3Z1", address: "Delhi, DL", status: "active", rating: 3.9, createdAt: "2025-03-20" },
  { id: "v4", name: "Initech Electricals", email: "info@initech.test", phone: "+91 90011 22334", category: "Electrical", gst: "33QRSTU3456V4Z7", address: "Chennai, TN", status: "inactive", rating: 3.4, createdAt: "2025-04-15" },
  { id: "v5", name: "Soylent Materials", email: "ops@soylent.test", phone: "+91 90022 33445", category: "Raw Materials", gst: "24WXYZA7890B5Z3", address: "Ahmedabad, GJ", status: "blacklisted", rating: 2.1, createdAt: "2024-11-09" },
];

export const seedRfqs: Rfq[] = [
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

export const seedQuotations: Quotation[] = [
  { id: "q1", rfqId: "r1", vendorId: "v1", lines: [{ itemId: "li1", unitPrice: 78000 }, { itemId: "li2", unitPrice: 6500 }], deliveryDays: 14, taxPercent: 18, notes: "Bulk discount applied.", status: "submitted", submittedAt: "2026-06-03" },
  { id: "q2", rfqId: "r1", vendorId: "v3", lines: [{ itemId: "li1", unitPrice: 82000 }, { itemId: "li2", unitPrice: 5800 }], deliveryDays: 10, taxPercent: 18, notes: "Free onsite setup.", status: "submitted", submittedAt: "2026-06-04" },
  { id: "q3", rfqId: "r2", vendorId: "v2", lines: [{ itemId: "li3", unitPrice: 14500 }], deliveryDays: 21, taxPercent: 18, notes: "Installation included.", status: "submitted", submittedAt: "2026-06-02" },
];

export const seedPOs: PurchaseOrder[] = [];

export const seedActivity: ActivityEntry[] = [
  { id: "a1", at: "2026-06-01T09:00:00Z", actor: "Procurement Officer", action: "RFQ created", detail: "RFQ-2026-0001 — Office laptops Q2", refType: "rfq", refId: "r1" },
  { id: "a2", at: "2026-06-03T11:30:00Z", actor: "Acme Industrial Supplies", action: "Quotation submitted", detail: "Quote for RFQ-2026-0001", refType: "quotation", refId: "q1" },
  { id: "a3", at: "2026-06-04T14:15:00Z", actor: "Globex Office Goods", action: "Quotation submitted", detail: "Quote for RFQ-2026-0001", refType: "quotation", refId: "q2" },
];