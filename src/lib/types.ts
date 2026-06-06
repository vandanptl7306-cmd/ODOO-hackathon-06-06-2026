export type Role = "officer" | "vendor" | "approver" | "admin";

export interface User {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  country?: string;
  additionalInfo?: string;
  avatarUrl?: string;
}

export type VendorStatus = "active" | "pending" | "blocked";

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  gst: string;
  address: string;
  status: VendorStatus;
  rating: number; // 0-5
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
  category?: string;
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