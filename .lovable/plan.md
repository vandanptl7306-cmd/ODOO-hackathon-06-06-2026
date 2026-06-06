## VendorBridge — Frontend Build Plan

A complete frontend prototype of the VendorBridge procurement ERP. No backend yet — all data is seeded as mock data and persisted in `localStorage` so flows (create RFQ → vendor quotes → compare → approve → PO/invoice) feel real across reloads. Lovable Cloud can be added later to wire real auth and DB.

### Defaults I'm choosing for you
- **Scope:** All core modules (Auth UI, Vendors, RFQs, Quotations, Comparison, Approvals, PO/Invoice, Activity Log, basic Reports).
- **Data:** In-memory store seeded on first load, persisted to `localStorage`. Mock login (no real auth).
- **Roles:** All 4 (Procurement Officer, Vendor, Manager/Approver, Admin) with a role switcher in the top bar so you can demo every view.
- **Design:** Navy Trust enterprise palette — deep navy `#0f1b3d`, steel blue accents, crisp white surfaces; Inter-style sans body, tighter display headings; dense data-table layouts with generous card padding for forms.

### Information architecture (routes)
```
/login                       Mock email/password screen (any creds accepted)
/forgot-password             Static recovery form
/                            Role-aware dashboard (KPIs + recent activity)
/vendors                     List, filter, status badges
/vendors/new, /vendors/$id   Create / detail+edit
/rfqs                        List with status chips, deadline
/rfqs/new, /rfqs/$id         Create + detail (line items, attached vendors, quotes received)
/quotations                  Vendor view: incoming RFQs + my submissions
/quotations/$rfqId/submit    Vendor quote form
/rfqs/$id/compare            Side-by-side quotation comparison, lowest-price highlight
/approvals                   Approver inbox: pending quotations, approve/reject + remarks
/purchase-orders             PO list
/purchase-orders/$id         PO detail + auto-generated invoice (print/PDF via window.print)
/activity                    Audit timeline
/reports                     Spend by vendor, monthly trend, top categories (Recharts)
/admin/users                 Admin-only user/role management (mock)
/settings                    Profile + preferences
```

### Modules & key UI
- **Auth (mock):** Login, signup, forgot password screens. "Login" stores a fake session + selected role in `localStorage`. Protected routes via a `_authenticated` layout.
- **Role switcher:** Dropdown in top bar to swap between PO / Vendor / Approver / Admin — nav and dashboard adapt.
- **Vendors:** Table with search, category filter, status (Active/Inactive/Blacklisted) chips; create/edit drawer with GST, contact, category fields.
- **RFQs:** Create with title, line items (name/qty/spec), deadline, vendor multi-select, attachment placeholder. Detail page shows invited vendors + their quotes.
- **Quotations:** Vendor sees assigned RFQs; submit form with unit price, delivery days, notes; edit until approved.
- **Comparison:** Side-by-side table per RFQ — lowest price highlighted, fastest delivery flagged, rating stars (mock).
- **Approval workflow:** Approver inbox with approve/reject + remark; state transitions logged.
- **PO & Invoice:** On approval, auto-generate PO number (`PO-YYYYMM-####`) and invoice with tax/total calc; print-to-PDF via browser print stylesheet; "Send via email" is a toast stub.
- **Activity log:** Append-only timeline of every state change (RFQ created, quote submitted, approved, PO issued).
- **Reports:** Recharts cards — total spend, spend by vendor (bar), monthly procurement trend (line), top categories (pie). CSV export of vendor list.

### Design system
- Navy Trust tokens in `src/styles.css` (oklch): `--primary` deep navy, `--accent` steel blue, `--success` emerald, `--warning` amber, `--destructive` red. Subtle elevation shadows, `--radius 0.5rem`, dense tables, sticky table headers.
- Shared components: `AppShell` (sidebar + topbar + role switcher), `PageHeader`, `StatusBadge`, `DataTable`, `EmptyState`, `KpiCard`, `ConfirmDialog` — all built on existing shadcn primitives.

### Technical notes
- **State:** Lightweight Zustand store per domain (`useVendors`, `useRfqs`, `useQuotations`, `usePOs`, `useActivity`, `useAuth`) with a `persist` middleware to `localStorage`. Seed data on first run.
- **Routing:** TanStack Router file-based routes under `src/routes/`, with an `_authenticated` layout that redirects to `/login` if no mock session.
- **Charts:** Recharts (already available via shadcn `chart`).
- **PDF/Print:** Use `window.print()` with a print stylesheet on the invoice/PO detail page — no extra deps.
- **Forms:** `react-hook-form` + `zod` for create/edit dialogs.
- **No backend calls.** Lovable Cloud is intentionally not enabled in this pass.

### Out of scope (this pass)
- Real authentication, real email sending, real file uploads (placeholders only).
- Server-side audit log, multi-tenant org separation.
- Realtime notifications (shown as in-app toasts only).

### Follow-ups you can ask for next
- Enable Lovable Cloud → migrate stores to Postgres + real auth + RLS by role.
- Real email invoices (Resend), real file uploads (Storage), PDF generation server-side.
- Vendor portal as a separate subdomain / public link tokens.
