Given:
- Frontend: Astro/Svelte
- Backend: Fastify
- Database: Supabase/PostgreSQL with RLS
- Expected scale: Lightweight bookkeeping for independent consultants (<50 clients)
- Key features: 
  - Dashboard with AR snapshot, recent activity, net profit (USD), quick links
  - Transaction Hub (Quotes, Invoices, Payments) with unified list, filters, statuses, line item editor, client/project association, smart PO inheritance, multiple payments, conversions (Quote→Project, Quote→Invoice), templated email sending, PDF generation, official copies storage
  - Expense Manager with quick add, categories, project linking, receipt upload, billing controls (billable/unbilled/billed/user_paid), add to invoice workflow
  - Client Directory with searchable list, contact/billing defaults, inline creation, tax/VAT handling, payment terms
  - Project Management under clients with status tracking (Active/Completed/Archived), default PO numbers, internal notes, project dashboards
  - Reporting Center with P&L, Project Profitability, Balance Sheet, AR aging reports, date/project/client filters, CSV/PDF exports
  - Settings for user profile, business defaults, tax rates, numbering prefixes, email templates, archive/export/import
- Database Schema (condensed):
  - Core entities: user_profiles, clients, projects, documents, document_line_items, payments, expenses, categories, attachments, notes, tax_rates
  - Key relationships: users→clients→projects→documents; documents→line_items+payments; projects→expenses; all entities have user_id for tenancy
  - Tenancy: Row-level security (RLS) on all tables with user_id = auth.uid()
  - Monetary values: Stored as USD cents (integer) to avoid floating precision
- Budget: Lean startup budget - minimal UI, high efficiency, shared components, template-driven outputs, cost-effective hosting (Cloudflare, Railway, Supabase)

Design a system architecture including:

1. Architecture Pattern
   - Recommend pattern (monolith, microservices, serverless)
   - Justify the choice

2. Component Diagram
   - Identify all major components
   - Show how they interact
   - Include external services

3. Data Flow
   - Describe key user flows
   - Show data movement through system
   - Identify potential bottlenecks

4. Scalability Strategy
   - How will this scale to <50 clients?
   - What components need horizontal scaling?
   - Caching strategy

5. Infrastructure
   - Hosting recommendations for Cloudflare Pages and Railway
   - Database hosting approach with Supabase
   - CDN needs
   - Background job processing for PDF/email generation

6. Monitoring & Observability
   - What metrics to track
   - Alerting strategy
   - Logging approach

Output: Architecture diagram (Mermaid or similar) + detailed explanation