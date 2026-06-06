# VendorBridge — Modern Procurement & Vendor Management ERP

VendorBridge is a premium, responsive Web ERP designed for procurement officers, approvers, and vendors to streamline the lifecycle of Request for Quotations (RFQs), quotations submissions, purchase orders, and billing invoices.

Built during the **ODDO Hackathon**, this project maps visual sketch wireframes to a working web application with dynamic state management and persistent data caching.

---

## 🚀 Key Features & Aligned Screens

### 1. Global Navigation & Layout Theme
- **App Topbar**: Full-width branding header with custom mint green coloring (`bg-[oklch(0.93_0.05_160)]`), home logo, and role switcher dropdown (`Procurement Officer`, `Vendor`, `Manager / Approver`, `Admin`).
- **Sketch-Style Sidebar**: Custom light navigation sidebar with simplified dashed `-` list icons and mint-green highlights for selected routes.

### 2. Dashboard View (Screen 3)
- **Financial Analytics**: Displays monthly PO spend formatted in Indian Lakhs (e.g. `₹2.3L`).
- **Spending Trends Charts**: Composite visual charts showing area distribution, Recharts circular pie chart category splits, and orange volume bars.
- **PO Fallback Table**: Displays default recent orders including active, pending, and draft states.

### 3. Vendors Registry Directory (Screen 4)
- **Responsive Status Tabs**: Real-time filtering using status pill tabs: `All (28)`, `Active (21)`, `Pending (4)`, and `Blocked (3)`.
- **Search Panel**: Interactive supplier search with custom descriptive placeholders.
- **Detailed Profiles**: Clickable "View" directory linking to full profiles for modification and status toggles.

### 4. Create RFQ (Screen 5)
- **Visual Stepper**: Custom horizontal progress stepper indicator (`1` -- `2` -- `3`).
- **Two-Column Form**:
  - *Left*: Detail inputs (Title, Category selection, Deadline text, Description).
  - *Right*: Interactive line items table (inline item/qty/unit changes) and Assign Vendors panel (invited vendors chip list with `x` delete capability).
- **Submissions**: Action actions to either **Save & Send to Vendors** (open state) or **Save as Draft** (draft state).

### 5. Submit Quotations Form (Screen 6)
- **Direct Access**: Clicking **Quotations** in the sidebar directly opens the detailed quote submission form for the active RFQ.
- **Pricing Table**: Controlled items pricing grid (Item, Qty, Unit Price input, Total, Delivery days input) with dynamic updates.
- **GST & Terms Split**: Displays input fields for tax percent (defaults to `18%`) and note details (defaults to `"Payment terms: 20 days net..."`).
- **Grand Total Calculation**: Dynamically computes subtotal, GST (18%), and final grand total values.

### 6. Purchase Order & Invoice (Screen 9)
- **Direct Invoice View**: Clicking **Invoices** in the sidebar directly displays the single invoice detailed page for default reference `PO-2025-0068`.
- **Split Tax Calculation**: Automatically calculates and renders split **CGST (9%)** and **SGST (9%)** lines matching the mockup total (`₹2,00,010`).
- **Billing Details**: Dual bill-to (organization) and vendor address blocks.
- **Status Toggle Bar**: Displays PO status badge (`Pending Payment` / `Paid`) with a clickable interactive toggle button.

---

## 🛠️ Technology Stack
- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/) & [TanStack Router](https://tanstack.com/router/)
- **State Persistence**: [Zustand](https://github.com/pmndrs/zustand) with local storage sync
- **Styling**: TailwindCSS / Vanilla CSS
- **Data Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Quick Start Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) or [Bun](https://bun.sh/) installed.

### 1. Install Dependencies
```bash
npm install
# or
bun install
```

### 2. Start Development Server
Runs the app in development mode at `http://localhost:8081/`.
```bash
npm run dev
```

### 3. Build for Production
Compiles client assets and bundles SSR environment builds.
```bash
npm run build
```
