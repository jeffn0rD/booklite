-- =====================================================
-- Booklite Database Schema - Core Tables
-- PostgreSQL/Supabase Implementation
-- =====================================================
-- Description: Core table definitions with primary keys
-- Dependencies: Supabase Auth (auth.users table)
-- Version: 1.0
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER_PROFILES (1:1 with auth.users)
-- =====================================================
CREATE TABLE user_profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name text,
    legal_name text,
    address_line1 text,
    address_line2 text,
    city text,
    region text,
    postal_code text,
    country text, -- ISO-3166 alpha-2 recommended
    tax_id text,
    logo_attachment_id bigint,
    default_tax_rate_id bigint,
    default_payment_terms_days int,
    numbering_quote_prefix text,
    numbering_invoice_prefix text,
    numbering_padding int DEFAULT 4,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT user_profiles_business_name_length CHECK (length(business_name) <= 200),
    CONSTRAINT user_profiles_legal_name_length CHECK (length(legal_name) <= 200),
    CONSTRAINT user_profiles_address_line1_length CHECK (length(address_line1) <= 200),
    CONSTRAINT user_profiles_address_line2_length CHECK (length(address_line2) <= 200),
    CONSTRAINT user_profiles_city_length CHECK (length(city) <= 100),
    CONSTRAINT user_profiles_region_length CHECK (length(region) <= 100),
    CONSTRAINT user_profiles_postal_code_length CHECK (length(postal_code) <= 20),
    CONSTRAINT user_profiles_tax_id_length CHECK (length(tax_id) <= 50),
    CONSTRAINT user_profiles_payment_terms_range CHECK (default_payment_terms_days IS NULL OR (default_payment_terms_days >= 0 AND default_payment_terms_days <= 365)),
    CONSTRAINT user_profiles_quote_prefix_length CHECK (length(numbering_quote_prefix) <= 10),
    CONSTRAINT user_profiles_invoice_prefix_length CHECK (length(numbering_invoice_prefix) <= 10),
    CONSTRAINT user_profiles_padding_range CHECK (numbering_padding >= 2 AND numbering_padding <= 10)
);

COMMENT ON TABLE user_profiles IS 'Issuer defaults and branding for users. Single row per user.';

-- =====================================================
-- 2. CLIENTS
-- =====================================================
CREATE TABLE clients (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    billing_address jsonb,
    tax_vat_id text,
    default_tax_rate_id bigint,
    default_payment_terms_days int,
    default_currency text DEFAULT 'USD',
    archived_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT clients_name_length CHECK (length(name) >= 1 AND length(name) <= 200),
    CONSTRAINT clients_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT clients_tax_vat_id_length CHECK (length(tax_vat_id) <= 50),
    CONSTRAINT clients_payment_terms_range CHECK (default_payment_terms_days IS NULL OR (default_payment_terms_days >= 0 AND default_payment_terms_days <= 365)),
    CONSTRAINT clients_currency_usd CHECK (default_currency = 'USD')
);

COMMENT ON TABLE clients IS 'Customer directory with billing and contact defaults';

-- =====================================================
-- 3. PROJECTS
-- =====================================================
CREATE TABLE projects (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id bigint NOT NULL,
    name text NOT NULL,
    status text NOT NULL DEFAULT 'Active',
    default_po_number varchar(50),
    notes text,
    origin_quote_id bigint,
    archived_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT projects_name_length CHECK (length(name) >= 1 AND length(name) <= 200),
    CONSTRAINT projects_status_enum CHECK (status IN ('Active', 'Completed', 'Archived')),
    CONSTRAINT projects_po_number_length CHECK (length(default_po_number) <= 50)
);

COMMENT ON TABLE projects IS 'Projects under clients with default PO, internal notes, and status';

-- =====================================================
-- 4. DOCUMENTS (Quotes and Invoices)
-- =====================================================
CREATE TABLE documents (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    number text,
    client_id bigint NOT NULL,
    project_id bigint,
    po_number varchar(50),
    issue_date date,
    due_date date,
    expiry_date date,
    public_notes text,
    internal_notes text,
    currency text NOT NULL DEFAULT 'USD',
    subtotal_cents int NOT NULL DEFAULT 0,
    tax_total_cents int NOT NULL DEFAULT 0,
    total_cents int NOT NULL DEFAULT 0,
    amount_paid_cents int NOT NULL DEFAULT 0,
    balance_due_cents int NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'Draft',
    accepted_at timestamptz,
    sent_at timestamptz,
    finalized_at timestamptz,
    archived_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT documents_type_enum CHECK (type IN ('quote', 'invoice')),
    CONSTRAINT documents_po_number_length CHECK (length(po_number) <= 50),
    CONSTRAINT documents_currency_usd CHECK (currency = 'USD'),
    CONSTRAINT documents_subtotal_positive CHECK (subtotal_cents >= 0),
    CONSTRAINT documents_tax_total_positive CHECK (tax_total_cents >= 0),
    CONSTRAINT documents_total_positive CHECK (total_cents >= 0),
    CONSTRAINT documents_amount_paid_positive CHECK (amount_paid_cents >= 0),
    CONSTRAINT documents_balance_due_positive CHECK (balance_due_cents >= 0),
    CONSTRAINT documents_invoice_status CHECK (
        type != 'invoice' OR status IN ('Draft', 'Sent', 'Unpaid', 'Partial', 'Paid', 'Void')
    ),
    CONSTRAINT documents_quote_status CHECK (
        type != 'quote' OR status IN ('Draft', 'Sent', 'Accepted', 'Expired')
    )
);

COMMENT ON TABLE documents IS 'Quotes and Invoices with lifecycle statuses, totals, and PDF/email officialization';

-- =====================================================
-- 5. DOCUMENT_LINE_ITEMS
-- =====================================================
CREATE TABLE document_line_items (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id bigint NOT NULL,
    position int NOT NULL,
    description text NOT NULL,
    quantity numeric(12,4) NOT NULL,
    unit varchar(20),
    unit_price_cents int NOT NULL,
    line_subtotal_cents int NOT NULL,
    tax_rate_percent numeric(7,4),
    tax_amount_cents int NOT NULL DEFAULT 0,
    line_total_cents int NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT line_items_position_positive CHECK (position >= 1),
    CONSTRAINT line_items_description_length CHECK (length(description) >= 1 AND length(description) <= 1000),
    CONSTRAINT line_items_quantity_positive CHECK (quantity >= 0),
    CONSTRAINT line_items_unit_length CHECK (length(unit) <= 20),
    CONSTRAINT line_items_unit_price_positive CHECK (unit_price_cents >= 0),
    CONSTRAINT line_items_subtotal_positive CHECK (line_subtotal_cents >= 0),
    CONSTRAINT line_items_tax_rate_range CHECK (tax_rate_percent IS NULL OR (tax_rate_percent >= 0 AND tax_rate_percent <= 100)),
    CONSTRAINT line_items_tax_amount_positive CHECK (tax_amount_cents >= 0),
    CONSTRAINT line_items_total_positive CHECK (line_total_cents >= 0)
);

COMMENT ON TABLE document_line_items IS 'Line items for quotes/invoices with single tax rate per line';

-- =====================================================
-- 6. PAYMENTS
-- =====================================================
CREATE TABLE payments (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_id bigint NOT NULL,
    date date NOT NULL,
    amount_cents int NOT NULL,
    method varchar(50),
    reference varchar(100),
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT payments_amount_positive CHECK (amount_cents > 0),
    CONSTRAINT payments_method_length CHECK (length(method) <= 50),
    CONSTRAINT payments_reference_length CHECK (length(reference) <= 100)
);

COMMENT ON TABLE payments IS 'Payments recorded against invoices; derive invoice status';

-- =====================================================
-- 7. EXPENSES
-- =====================================================
CREATE TABLE expenses (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL,
    vendor varchar(200),
    category_id bigint,
    project_id bigint,
    total_amount_cents int NOT NULL,
    tax_amount_cents int NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'USD',
    receipt_attachment_id bigint,
    notes text,
    billable boolean NOT NULL DEFAULT false,
    billing_status text NOT NULL DEFAULT 'unbilled',
    linked_invoice_id bigint,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT expenses_vendor_length CHECK (length(vendor) <= 200),
    CONSTRAINT expenses_total_positive CHECK (total_amount_cents >= 0),
    CONSTRAINT expenses_tax_positive CHECK (tax_amount_cents >= 0),
    CONSTRAINT expenses_tax_not_exceed_total CHECK (tax_amount_cents <= total_amount_cents),
    CONSTRAINT expenses_currency_usd CHECK (currency = 'USD'),
    CONSTRAINT expenses_billing_status_enum CHECK (billing_status IN ('unbilled', 'billed', 'user_paid'))
);

COMMENT ON TABLE expenses IS 'Costs with categories, receipts, billable flags and linkage to invoices';

-- =====================================================
-- 8. CATEGORIES
-- =====================================================
CREATE TABLE categories (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name varchar(100) NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT categories_name_length CHECK (length(name) <= 100)
);

COMMENT ON TABLE categories IS 'User-defined expense categories';

-- =====================================================
-- 9. ATTACHMENTS
-- =====================================================
CREATE TABLE attachments (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bucket text NOT NULL,
    path text NOT NULL,
    mime_type text NOT NULL,
    size_bytes int NOT NULL,
    sha256 text,
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT attachments_size_positive CHECK (size_bytes >= 0),
    CONSTRAINT attachments_sha256_format CHECK (sha256 IS NULL OR length(sha256) = 64)
);

COMMENT ON TABLE attachments IS 'Binary objects metadata (receipts, PDFs, logos) stored in Cloudflare';

-- =====================================================
-- 10. EMAIL_LOGS
-- =====================================================
CREATE TABLE email_logs (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id bigint NOT NULL,
    to_email text NOT NULL,
    subject varchar(200) NOT NULL,
    body text NOT NULL,
    status text NOT NULL DEFAULT 'queued',
    provider_message_id varchar(200),
    sent_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT email_logs_to_email_format CHECK (to_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT email_logs_subject_length CHECK (length(subject) <= 200),
    CONSTRAINT email_logs_status_enum CHECK (status IN ('queued', 'sent', 'failed')),
    CONSTRAINT email_logs_provider_id_length CHECK (length(provider_message_id) <= 200)
);

COMMENT ON TABLE email_logs IS 'Record of outgoing document emails (to/subject/body/provider status)';

-- =====================================================
-- 11. NUMBER_SEQUENCES
-- =====================================================
CREATE TABLE number_sequences (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    prefix varchar(10) NOT NULL,
    current_value int NOT NULL DEFAULT 0,
    padding int NOT NULL DEFAULT 4,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT number_sequences_type_enum CHECK (type IN ('quote', 'invoice')),
    CONSTRAINT number_sequences_prefix_length CHECK (length(prefix) <= 10),
    CONSTRAINT number_sequences_current_value_positive CHECK (current_value >= 0),
    CONSTRAINT number_sequences_padding_range CHECK (padding >= 2 AND padding <= 10)
);

COMMENT ON TABLE number_sequences IS 'Per-user counters for quote/invoice numbering with prefix/padding';

-- =====================================================
-- 12. NOTES
-- =====================================================
CREATE TABLE notes (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity text NOT NULL,
    entity_id bigint NOT NULL,
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT notes_entity_enum CHECK (entity IN ('client', 'project'))
);

COMMENT ON TABLE notes IS 'Internal notes on clients and projects';

-- =====================================================
-- 13. TAX_RATES
-- =====================================================
CREATE TABLE tax_rates (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name varchar(50) NOT NULL,
    rate_percent numeric(7,4) NOT NULL,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT tax_rates_name_length CHECK (length(name) <= 50),
    CONSTRAINT tax_rates_rate_range CHECK (rate_percent >= 0 AND rate_percent <= 100)
);

COMMENT ON TABLE tax_rates IS 'Per-user named tax rates with one default';

-- =====================================================
-- 14. OFFICIAL_COPIES
-- =====================================================
CREATE TABLE official_copies (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id bigint NOT NULL,
    pdf_attachment_id bigint NOT NULL,
    email_body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE official_copies IS 'Official rendered PDF and email body snapshots for documents (on Send/Finalize)';