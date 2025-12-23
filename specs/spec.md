Project: Lightweight bookkeeping for independent consultants (<50 clients)
Philosophy: Minimal UI, high efficiency, shared components, template-driven outputs; single-user (no teams), USD-only initially.

Architecture
- Frontend: Astro/Svelte static on Cloudflare
- Backend: Fastify on Railway (application logic, PDF/email generation)
- Database: Supabase/PostgreSQL with RLS; tenancy scoped by user_id (no Company entity)
- Storage: Cloudflare (receipts, PDFs, logos)

Modules (7)
1) Dashboard
   - Snapshot: AR, recent activity, net profit (USD), quick links.

2) Transaction Hub (Quotes, Invoices, Payments)
   - Unified list with filters; statuses:
     - Quote: Draft, Sent, Accepted, Expired
     - Invoice: Draft, Sent, Unpaid, Partial, Paid, Void
   - Editor: line items, single tax per line, notes (public/internal), auto numbers (per user/type)
   - Client/Project association (client required; project optional, filtered by client)
   - Smart PO: if project linked and invoice.po empty, inherit project.default_po_number (one-time)
   - Payments: multiple per invoice; status derived from payments vs total
   - Conversions: Quote → Project; Quote → Invoice
   - Send email (templated); Finalize & generate PDF; Download PDF
   - Official copies: on Send or Finalize, store rendered PDF + email body; future re-renders show warning if data changed and link to original
   - Currency: USD only (for now). Hidden currency field fixed to USD for future-safe expansion

3) Expense Manager
   - Quick add; categories; link to project; receipt upload
   - Billing controls:
     - billable (bool)
     - billing_status: unbilled | billed | user_paid
     - linked_invoice_id (nullable)
   - Add to Invoice workflow: list unbilled+billable expenses (by client/project), add selected as single line items; mark billed; receipt images can optionally attach to email/PDF

4) Client Directory
   - Searchable list; detail modal (contact, billing defaults, mini history)
   - Inline client creation during invoicing
   - Client-level defaults: primary email, billing address, tax/VAT id, default tax rate, default payment terms (days), default currency (hidden, fixed to USD initially)

5) Project Management
   - Projects under clients; status: Active, Completed, Archived
   - Default PO per project; internal notes
   - Dashboard per project: revenue (invoices) and costs (expenses)

6) Reporting Center
   - Reports (USD):
     - P&L: Revenue − Expenses = Net Profit
     - Project Profitability: Revenue(project) − Expenses(project)
     - Balance Sheet (lightweight): Assets (Cash + AR) vs Liabilities (Tax Payable)
     - AR: Unpaid/Partial invoices list
   - Filters: date range; project; client; simple charts
   - Exports: CSV (reports), PDF (documents), JSON snapshots (optional)

7) Settings
   - User profile (issuer defaults): name/business, address, tax ID, logo, default tax rate, default payment terms; numbering (per-type prefix, padding)
   - Email templates (quote/invoice)
   - Archive/Export/Import

Data Model (condensed)
- Tenancy: All core rows have user_id (FK → auth.user)
- Clients: standalone (no company required)
- Projects: client_id, default_po_number, notes, status
- Documents: type (quote/invoice), number (per-user/type), client_id, project_id?, po_number, issue/due/expiry dates, line items, taxes, notes
  - Totals: subtotal, tax_total, total (materialized)
  - Payments aggregate: amount_paid, balance_due (materialized)
  - Status logic:
    - Invoice: sum=0 → Unpaid; 0<sum<total → Partial; sum≥total → Paid
    - Quote expiry: if not accepted and past expiry → Expired
  - Historical copies: on Send/Finalize, store PDF + email body; re-renders warn and link to original
- Line Items: description, quantity, unit, unit_price, line_total, tax_rate (single), position
  - unit examples: hours, each, day, month, unit (free text for simplicity)
- Payments: invoice_id, date, amount, method, reference
- Expenses: date, vendor, category, project_id?, total_amount, tax_amount, attachment?, notes
  - Billing: billable, billing_status (unbilled|billed|user_paid), linked_invoice_id?
- Attachments: receipts, PDFs, logo (bucket/path/mime/size)
- Categories: expense categories
- Email Logs: send events for quotes/invoices (to, subject, body, status, provider id)
- Number Sequences: per-user counters (type=quote/invoice, prefix, current_value, padding)
- Notes: internal notes for client/project
- Tax Rates: per user (name, rate%), with one default
- Currency: fixed to USD initially (hidden fields ready for future multi-currency)

Key Workflows
A) Initial Setup (optional)
- Settings → enter issuer details → upload logo → set default tax and terms → save
- Can be skipped; first invoice uses current profile or prompts inline

B) Invoice with Project & PO
- Hub → New Invoice → select client → project dropdown filtered by client → if project chosen and PO empty, inherit project.default_po_number → add lines → save

C) Quote → Project
- Create/send quote → on accept → “Create Project from Quote” → project created under client with origin_quote_id → redirected to project details to add notes/PO

D) Partial Payments
- Open Sent Invoice ($1,000) → Record Payment ($500, date, method) → status Partial, balance $500 → later add $500 → status Paid

E) Project Expense
- Expense Manager → Add Expense → date/vendor/amount → select project (grouped by client) → upload receipt → save → appears in Project Profitability
- Mark expenses: unbilled/billed/user_paid; link to invoice when billed

F) Client & Project Notes
- Client Directory → select client → add internal notes → Project tab → add project note → save (internal only)

G) Standalone Project
- Client Directory → client → Projects tab → Add New Project → name → optional default PO + notes → save

H) Add New Client
- Directory → Add Client (name, email required; address/tax optional); or inline in Hub via modal → Save & Select

I) Add Expenses to Invoice
- In invoice editor → Add Expenses → list unbilled+billable expenses for client/project → select → import as single line items (vendor + date + description) → mark billed
- Option: attach selected receipt images to email/PDF

J) Official copies and sending
- Send or Finalize & generate PDF → store official PDF + email body → subsequent renders warn if data changed and link to original copy

Archive/Export/Import
- Archive: clients, projects, documents, expenses (soft-archive). Archived invoices cannot be unpaid (disallow archiving unpaid)
- Export (per-user): zip with JSON (entities), CSV (reports), PDFs (official docs), attachments (optionally included)
- Import: new inserts only (no upsert); re-key to avoid collisions
- Attachments included/excluded per-user option

Validation & Defaults
- Numbering: per-user per-type (quote/invoice) sequence with prefix/padding
- Tax: single rate per line, tax-exclusive pricing
- USD-only: keep currency fields constrained to USD; future multi-currency can be enabled without schema migration
- PO inheritance: one-time snapshot from project.default_po_number when linking a project at invoice creation
- Status derivations enforced by triggers; totals/materialized fields updated on line/expense/payment changes

Security/RLS
- All tenant data scoped by user_id (no company/org)
- Users can access only their own data rows
- Attachments segregated by user-owned paths/buckets

Templates/Branding
- Email templates per document type with variables
- Branding (logo, issuer address, name) from user profile; used in render
- Public vs internal notes on documents (internal not shown on PDFs)

UI Notes
- Minimal UI, inline creation (clients/projects), fast entry forms
- Filters on status/date/client/project
- Simple charts in Reporting Center

Future-safe (kept simple now)
- Hidden currency fields (set to USD) allow future multi-currency
- Optional “Brand/DBA” entity can be added later without refactoring core flows
- Can extend taxes to inclusive or multi-tax per line later if needed
