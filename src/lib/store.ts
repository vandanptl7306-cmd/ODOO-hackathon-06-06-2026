import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActivityEntry,
  PurchaseOrder,
  Quotation,
  QuotationStatus,
  Rfq,
  Role,
  User,
  Vendor,
} from "./types";
import {
  seedActivity,
  seedPOs,
  seedQuotations,
  seedRfqs,
  seedVendors,
} from "./seed";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function nextNumber(prefix: string, count: number) {
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${prefix}-${ym}-${String(count + 1).padStart(4, "0")}`;
}

interface AuthState {
  user: User | null;
  role: Role;
  login: (usernameOrEmail: string, name?: string, avatarUrl?: string, role?: Role, extra?: Partial<User>) => void;
  logout: () => void;
  setRole: (role: Role) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: "officer",
      login: (usernameOrEmail, name, avatarUrl, role, extra) => {
        const isEmail = usernameOrEmail.includes("@");
        const email = isEmail ? usernameOrEmail : `${usernameOrEmail}@vendorbridge.app`;
        const username = isEmail ? usernameOrEmail.split("@")[0] : usernameOrEmail;
        set({
          user: {
            id: "u_self",
            email,
            username,
            name: name || username,
            role: role || "officer",
            avatarUrl,
            ...extra,
          },
          role: role || "officer",
        });
      },
      logout: () => set({ user: null }),
      setRole: (role) => set({ role }),
    }),
    { name: "vb-auth" },
  ),
);

interface DataState {
  vendors: Vendor[];
  rfqs: Rfq[];
  quotations: Quotation[];
  pos: PurchaseOrder[];
  activity: ActivityEntry[];

  addVendor: (v: Omit<Vendor, "id" | "createdAt">) => Vendor;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  addRfq: (r: Omit<Rfq, "id" | "number" | "createdAt" | "status"> & { status?: RfqStatus }) => Rfq;
  updateRfq: (id: string, patch: Partial<Rfq>) => void;

  addQuotation: (q: Omit<Quotation, "id" | "submittedAt" | "status"> & { status?: QuotationStatus }) => Quotation;
  updateQuotation: (id: string, patch: Partial<Quotation>) => void;

  approveQuotation: (id: string, remark: string, approver: string) => PurchaseOrder | null;
  rejectQuotation: (id: string, remark: string, approver: string) => void;

  updatePO: (id: string, patch: Partial<PurchaseOrder>) => void;

  log: (entry: Omit<ActivityEntry, "id" | "at">) => void;
  reset: () => void;
}

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
      vendors: seedVendors,
      rfqs: seedRfqs,
      quotations: seedQuotations,
      pos: seedPOs,
      activity: seedActivity,

      addVendor: (v) => {
        const vendor: Vendor = {
          ...v,
          id: uid("v"),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        set((s) => ({ vendors: [vendor, ...s.vendors] }));
        get().log({ actor: "Admin", action: "Vendor added", detail: vendor.name, refType: "vendor", refId: vendor.id });
        return vendor;
      },
      updateVendor: (id, patch) =>
        set((s) => ({ vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)) })),
      deleteVendor: (id) =>
        set((s) => ({ vendors: s.vendors.filter((v) => v.id !== id) })),

      addRfq: (r) => {
        const rfq: Rfq = {
          ...r,
          id: uid("r"),
          number: nextNumber("RFQ", get().rfqs.length),
          createdAt: new Date().toISOString().slice(0, 10),
          status: r.status || "open",
        };
        set((s) => ({ rfqs: [rfq, ...s.rfqs] }));
        get().log({ actor: r.createdBy, action: "RFQ created", detail: `${rfq.number} — ${rfq.title}`, refType: "rfq", refId: rfq.id });
        return rfq;
      },
      updateRfq: (id, patch) =>
        set((s) => ({ rfqs: s.rfqs.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

      addQuotation: (q) => {
        const quotation: Quotation = {
          ...q,
          id: uid("q"),
          submittedAt: new Date().toISOString(),
          status: q.status || "submitted",
        };
        set((s) => ({ quotations: [quotation, ...s.quotations] }));
        const vendor = get().vendors.find((v) => v.id === q.vendorId);
        const rfq = get().rfqs.find((r) => r.id === q.rfqId);
        get().log({
          actor: vendor?.name || "Vendor",
          action: "Quotation submitted",
          detail: `Quote for ${rfq?.number ?? q.rfqId}`,
          refType: "quotation",
          refId: quotation.id,
        });
        return quotation;
      },
      updateQuotation: (id, patch) =>
        set((s) => ({ quotations: s.quotations.map((q) => (q.id === id ? { ...q, ...patch } : q)) })),

      approveQuotation: (id, remark, approver) => {
        const q = get().quotations.find((x) => x.id === id);
        if (!q) return null;
        const rfq = get().rfqs.find((r) => r.id === q.rfqId);
        if (!rfq) return null;
        const subtotal = q.lines.reduce((sum, line) => {
          const item = rfq.items.find((i) => i.id === line.itemId);
          return sum + (item ? item.quantity * line.unitPrice : 0);
        }, 0);
        const tax = +(subtotal * (q.taxPercent / 100)).toFixed(2);
        const total = +(subtotal + tax).toFixed(2);
        const po: PurchaseOrder = {
          id: uid("po"),
          number: nextNumber("PO", get().pos.length),
          rfqId: q.rfqId,
          quotationId: q.id,
          vendorId: q.vendorId,
          subtotal,
          tax,
          total,
          status: "issued",
          createdAt: new Date().toISOString().slice(0, 10),
        };
        set((s) => ({
          quotations: s.quotations.map((x) =>
            x.id === id
              ? { ...x, status: "approved", approvalRemark: remark }
              : x.rfqId === q.rfqId && x.status === "submitted"
                ? { ...x, status: "rejected", approvalRemark: "Another quotation was approved" }
                : x,
          ),
          rfqs: s.rfqs.map((r) => (r.id === q.rfqId ? { ...r, status: "awarded" } : r)),
          pos: [po, ...s.pos],
        }));
        get().log({ actor: approver, action: "Quotation approved", detail: `${rfq.number} → PO ${po.number}`, refType: "po", refId: po.id });
        return po;
      },
      rejectQuotation: (id, remark, approver) => {
        const q = get().quotations.find((x) => x.id === id);
        if (!q) return;
        set((s) => ({
          quotations: s.quotations.map((x) => (x.id === id ? { ...x, status: "rejected", approvalRemark: remark } : x)),
        }));
        const rfq = get().rfqs.find((r) => r.id === q.rfqId);
        get().log({ actor: approver, action: "Quotation rejected", detail: `${rfq?.number ?? ""} — ${remark}`, refType: "quotation", refId: id });
      },

      updatePO: (id, patch) =>
        set((s) => ({ pos: s.pos.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

      log: (entry) =>
        set((s) => ({
          activity: [
            { ...entry, id: uid("a"), at: new Date().toISOString() },
            ...s.activity,
          ].slice(0, 200),
        })),

      reset: () =>
        set({
          vendors: seedVendors,
          rfqs: seedRfqs,
          quotations: seedQuotations,
          pos: seedPOs,
          activity: seedActivity,
        }),
    }),
    { name: "vb-data" },
  ),
);

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function roleLabel(role: Role) {
  return {
    officer: "Procurement Officer",
    vendor: "Vendor",
    approver: "Manager / Approver",
    admin: "Admin",
  }[role];
}