import type { Vendor, Rfq, Quotation, PurchaseOrder, ActivityEntry } from "./types";

export const seedVendors: Vendor[] = [
  { id: "v1", name: "Infra Supplies Pvt Ltd", email: "sales@infrasupplies.test", phone: "XYZ Number", category: "Constructions", gst: "27AABCS1429Bz0", address: "Bengaluru, KA", status: "active", rating: 4.6, createdAt: "2025-01-12" },
  { id: "v2", name: "Tech Core LTD", email: "hello@techcore.test", phone: "XYZ Number", category: "IT", gst: "27AABCS1429Bz0", address: "Mumbai, MH", status: "active", rating: 4.2, createdAt: "2025-02-04" },
  { id: "v3", name: "FastLog Transport", email: "ops@fastlog.test", phone: "XYZ Number", category: "logistics", gst: "27AABCS1429Bz0", address: "Delhi, DL", status: "blocked", rating: 3.9, createdAt: "2025-03-20" },
  { id: "v4", name: "Initech Electricals", email: "info@initech.test", phone: "+91 90011 22334", category: "Electrical", gst: "33QRSTU3456V4Z7", address: "Chennai, TN", status: "pending", rating: 3.4, createdAt: "2025-04-15" },
  { id: "v5", name: "Soylent Materials", email: "ops@soylent.test", phone: "+91 90022 33445", category: "Raw Materials", gst: "24WXYZA7890B5Z3", address: "Ahmedabad, GJ", status: "blocked", rating: 2.1, createdAt: "2024-11-09" },
  // Active Vendors (need 19 more to make 21 active total)
  { id: "v6", name: "Apex Steel Corporation", email: "steel@apex.test", phone: "+91 98877 66554", category: "Constructions", gst: "27APEXS1234A1Z1", address: "Pune, MH", status: "active", rating: 4.5, createdAt: "2025-01-15" },
  { id: "v7", name: "Quantum IT Labs", email: "info@quantum.test", phone: "+91 97766 55443", category: "IT", gst: "27QUANI8876B1Z2", address: "Hyderabad, TS", status: "active", rating: 4.8, createdAt: "2025-02-10" },
  { id: "v8", name: "Dynamic Logistics Solutions", email: "logistics@dynamic.test", phone: "+91 96655 44332", category: "logistics", gst: "27DYNAP3456C1Z3", address: "Navi Mumbai, MH", status: "active", rating: 4.1, createdAt: "2025-03-05" },
  { id: "v9", name: "Globex Office Supplies", email: "sales@globexoffice.test", phone: "+91 95544 33221", category: "Office Supplies", gst: "27GLOBX9012D1Z4", address: "Gharoli, DL", status: "active", rating: 4.0, createdAt: "2025-03-12" },
  { id: "v10", name: "Prime Builders Group", email: "contact@primebuilders.test", phone: "+91 94433 22110", category: "Constructions", gst: "27PRIME5678E1Z5", address: "Kochi, KL", status: "active", rating: 4.3, createdAt: "2025-04-01" },
  { id: "v11", name: "Horizon Tech Services", email: "support@horizon.test", phone: "+91 93322 11009", category: "IT", gst: "27HORIZ1234F1Z6", address: "Gurugram, HR", status: "active", rating: 4.4, createdAt: "2025-04-18" },
  { id: "v12", name: "Express Logistics Group", email: "deliveries@expresslog.test", phone: "+91 92211 00998", category: "logistics", gst: "27EXPRE8876G1Z7", address: "Kolkata, WB", status: "active", rating: 4.2, createdAt: "2025-05-02" },
  { id: "v13", name: "Nexus Office Furniture", email: "info@nexusoffice.test", phone: "+91 91100 99887", category: "Office Supplies", gst: "27NEXUS3456H1Z8", address: "Noida, UP", status: "active", rating: 3.8, createdAt: "2025-05-15" },
  { id: "v14", name: "BuildFast Cement Ltd", email: "sales@buildfast.test", phone: "+91 90099 88776", category: "Constructions", gst: "27BUILD9012I1Z9", address: "Jaipur, RJ", status: "active", rating: 4.6, createdAt: "2025-05-28" },
  { id: "v15", name: "CloudSoft Engineering", email: "dev@cloudsoft.test", phone: "+91 98866 77553", category: "IT", gst: "27CLOUD5678J1Z0", address: "Bengaluru, KA", status: "active", rating: 4.7, createdAt: "2025-06-02" },
  { id: "v16", name: "Global Freight Carriers", email: "freight@global.test", phone: "+91 97755 66442", category: "logistics", gst: "27GLOBA1234K1Z1", address: "Chennai, TN", status: "active", rating: 4.3, createdAt: "2025-06-14" },
  { id: "v17", name: "Elite Stationery Hub", email: "sales@elitestationery.test", phone: "+91 96644 55331", category: "Office Supplies", gst: "27ELITE8876L1Z2", address: "Surat, GJ", status: "active", rating: 4.0, createdAt: "2025-06-25" },
  { id: "v18", name: "Omega Steel Fabricators", email: "omega@omega.test", phone: "+91 95533 44220", category: "Constructions", gst: "27OMEGA3456M1Z3", address: "Visakhapatnam, AP", status: "active", rating: 4.2, createdAt: "2025-07-02" },
  { id: "v19", name: "Intellect Solutions", email: "info@intellect.test", phone: "+91 94422 33119", category: "IT", gst: "27INTE79012N1Z4", address: "Indore, MP", status: "active", rating: 4.5, createdAt: "2025-07-15" },
  { id: "v20", name: "Rapid Delivery Systems", email: "rapid@rapid.test", phone: "+91 93311 22008", category: "logistics", gst: "27RAPID5678O1Z5", address: "Lucknow, UP", status: "active", rating: 4.1, createdAt: "2025-07-28" },
  { id: "v21", name: "Supreme Paper Goods", email: "paper@supreme.test", phone: "+91 92200 11997", category: "Office Supplies", gst: "27SUPRE1234P1Z6", address: "Patna, BR", status: "active", rating: 3.9, createdAt: "2025-08-05" },
  { id: "v22", name: "Vanguard Builders", email: "vanguard@vanguard.test", phone: "+91 91199 00886", category: "Constructions", gst: "27VANGU8876Q1Z7", address: "Bhopal, MP", status: "active", rating: 4.4, createdAt: "2025-08-20" },
  { id: "v23", name: "Silicon Valley Tech", email: "sv@svtech.test", phone: "+91 90088 99775", category: "IT", gst: "27SILIC3456R1Z8", address: "Gandhinagar, GJ", status: "active", rating: 4.6, createdAt: "2025-09-02" },
  { id: "v24", name: "Cargo Transporters Co", email: "cargo@cargoco.test", phone: "+91 98855 66443", category: "logistics", gst: "27CARGO9012S1Z9", address: "Ludhiana, PB", status: "active", rating: 4.0, createdAt: "2025-09-15" },
  // Pending Vendors (need 3 more to make 4 pending total)
  { id: "v25", name: "Eco Packaging Ltd", email: "eco@ecopack.test", phone: "+91 97744 55332", category: "Office Supplies", gst: "27ECOPA5678T1Z0", address: "Nashik, MH", status: "pending", rating: 3.6, createdAt: "2025-09-28" },
  { id: "v26", name: "Matrix Electricals", email: "matrix@matrix.test", phone: "+91 96633 44221", category: "Electrical", gst: "27MATRI1234U1Z1", address: "Dehradun, UK", status: "pending", rating: 3.2, createdAt: "2025-10-05" },
  { id: "v27", name: "Delta Woodcrafts", email: "delta@delta.test", phone: "+91 95522 33110", category: "Constructions", gst: "27DELTA8876V1Z2", address: "Guwahati, AS", status: "pending", rating: 3.5, createdAt: "2025-10-18" },
  // Blocked Vendors (need 1 more to make 3 blocked total)
  { id: "v28", name: "Unitech Components", email: "unitech@unitech.test", phone: "+91 94411 22009", category: "Electrical", gst: "27UNITE3456W1Z3", address: "Shimla, HP", status: "blocked", rating: 1.8, createdAt: "2025-11-01" },
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
  {
    id: "r3",
    number: "RFQ-2026-0003",
    title: "Office Furniture procurement Q2",
    description: "Ergonomic chairs and standing desks for 3rd floor",
    items: [
      { id: "li4", name: "Ergonomic chair", quantity: 25, unit: "NOS", specification: "High back mesh, adjustable armrest" },
      { id: "li5", name: "Tech Core LTD", quantity: 10, unit: "NOS", specification: "Dual motor, height adjustable" },
    ],
    deadline: "15 June 2025",
    invitedVendorIds: ["v1", "v2"],
    status: "open",
    createdBy: "Procurement Officer",
    category: "Furniture",
    createdAt: "2026-06-05",
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