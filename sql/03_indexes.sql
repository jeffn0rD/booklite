-- =====================================================
-- Booklite Database Schema - Indexes
-- PostgreSQL/Supabase Implementation
-- =====================================================
-- Description: Performance indexes for common query patterns
-- Dependencies: 01_schema_core.sql, 02_constraints.sql
-- Version: 1.0
-- =====================================================

-- =====================================================
-- USER_PROFILES INDEXES
-- =====================================================
-- Primary key index is implicit
CREATE INDEX idx_user_profiles_logo ON user_profiles(logo_attachment_id);
CREATE INDEX idx_user_profiles_default_tax_rate ON user_profiles(default_tax_rate_id);

-- =====================================================
-- CLIENTS INDEXES
-- =====================================================
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_user_archived ON clients(user_id, archived_at) WHERE archived_at IS NULL;
CREATE INDEX idx_clients_default_tax_rate ON clients(default_tax_rate_id);

-- =====================================================
-- PROJECTS INDEXES
-- =====================================================
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_user_client ON projects(user_id, client_id);
CREATE INDEX idx_projects_user_client_status ON projects(user_id, client_id, status);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);
CREATE INDEX idx_projects_user_archived ON projects(user_id, archived_at) WHERE archived_at IS NULL;
CREATE INDEX idx_projects_origin_quote ON projects(origin_quote_id);

-- =====================================================
-- DOCUMENTS INDEXES
-- =====================================================
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_user_type ON documents(user_id, type);
CREATE INDEX idx_documents_user_type_status ON documents(user_id, type, status);
CREATE INDEX idx_documents_user_client_type ON documents(user_id, client_id, type);
CREATE INDEX idx_documents_user_client_type_status ON documents(user_id, client_id, type, status);
CREATE INDEX idx_documents_user_project_type ON documents(user_id, project_id, type);
CREATE INDEX idx_documents_user_issue_date ON documents(user_id, issue_date) WHERE issue_date IS NOT NULL;
CREATE INDEX idx_documents_user_due_date ON documents(user_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_documents_user_expiry_date ON documents(user_id, expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_documents_user_archived ON documents(user_id, archived_at) WHERE archived_at IS NULL;

-- Partial index for Accounts Receivable (unpaid/partial invoices)
CREATE INDEX idx_documents_ar_due_date ON documents(user_id, due_date, balance_due_cents) 
    WHERE type = 'invoice' AND status IN ('Unpaid', 'Partial');

-- Partial index for sent documents
CREATE INDEX idx_documents_sent ON documents(user_id, sent_at) 
    WHERE sent_at IS NOT NULL;

-- Partial index for finalized documents
CREATE INDEX idx_documents_finalized ON documents(user_id, finalized_at) 
    WHERE finalized_at IS NOT NULL;

-- =====================================================
-- DOCUMENT_LINE_ITEMS INDEXES
-- =====================================================
CREATE INDEX idx_line_items_user_id ON document_line_items(user_id);
CREATE INDEX idx_line_items_document_id ON document_line_items(document_id);
CREATE INDEX idx_line_items_document_position ON document_line_items(document_id, position);
CREATE INDEX idx_line_items_user_document ON document_line_items(user_id, document_id);

-- =====================================================
-- PAYMENTS INDEXES
-- =====================================================
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_user_date ON payments(user_id, date);
CREATE INDEX idx_payments_invoice_date ON payments(invoice_id, date);
CREATE INDEX idx_payments_date_desc ON payments(date DESC);

-- =====================================================
-- EXPENSES INDEXES
-- =====================================================
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_linked_invoice_id ON expenses(linked_invoice_id);
CREATE INDEX idx_expenses_receipt_attachment ON expenses(receipt_attachment_id);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX idx_expenses_user_project_date ON expenses(user_id, project_id, date);
CREATE INDEX idx_expenses_user_category_date ON expenses(user_id, category_id, date);
CREATE INDEX idx_expenses_user_billing_status ON expenses(user_id, billing_status);
CREATE INDEX idx_expenses_user_billing_status_project ON expenses(user_id, billing_status, project_id);
CREATE INDEX idx_expenses_user_billable ON expenses(user_id, billable) WHERE billable = true;
CREATE INDEX idx_expenses_date_desc ON expenses(date DESC);

-- =====================================================
-- CATEGORIES INDEXES
-- =====================================================
CREATE INDEX idx_categories_user_id ON categories(user_id);
-- Unique index on (user_id, name) already created in constraints

-- =====================================================
-- ATTACHMENTS INDEXES
-- =====================================================
CREATE INDEX idx_attachments_user_id ON attachments(user_id);
CREATE INDEX idx_attachments_user_bucket ON attachments(user_id, bucket);
CREATE INDEX idx_attachments_bucket ON attachments(bucket);
CREATE INDEX idx_attachments_created_at ON attachments(created_at DESC);
-- Unique index on (user_id, bucket, path) already created in constraints

-- =====================================================
-- EMAIL_LOGS INDEXES
-- =====================================================
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_document_id ON email_logs(document_id);
CREATE INDEX idx_email_logs_user_created_at ON email_logs(user_id, created_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_user_status ON email_logs(user_id, status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at) WHERE sent_at IS NOT NULL;

-- =====================================================
-- NUMBER_SEQUENCES INDEXES
-- =====================================================
CREATE INDEX idx_number_sequences_user_id ON number_sequences(user_id);
-- Unique index on (user_id, type) already created in constraints

-- =====================================================
-- NOTES INDEXES
-- =====================================================
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_entity_entity_id ON notes(entity, entity_id);
CREATE INDEX idx_notes_user_entity ON notes(user_id, entity);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);

-- =====================================================
-- TAX_RATES INDEXES
-- =====================================================
CREATE INDEX idx_tax_rates_user_id ON tax_rates(user_id);
CREATE INDEX idx_tax_rates_user_default ON tax_rates(user_id, is_default);
-- Unique index on (user_id, name) already created in constraints
-- Partial unique index on (user_id) WHERE is_default = true already created in constraints

-- =====================================================
-- OFFICIAL_COPIES INDEXES
-- =====================================================
CREATE INDEX idx_official_copies_user_id ON official_copies(user_id);
CREATE INDEX idx_official_copies_document_id ON official_copies(document_id);
CREATE INDEX idx_official_copies_pdf_attachment ON official_copies(pdf_attachment_id);
CREATE INDEX idx_official_copies_created_at ON official_copies(created_at DESC);
-- Unique index on (user_id, document_id) already created in constraints

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON INDEX idx_documents_ar_due_date IS 'Optimize Accounts Receivable queries for unpaid/partial invoices';
COMMENT ON INDEX idx_documents_sent IS 'Optimize queries for sent documents';
COMMENT ON INDEX idx_documents_finalized IS 'Optimize queries for finalized documents';
COMMENT ON INDEX idx_expenses_user_billing_status_project IS 'Optimize "Add to Invoice" workflow queries';
COMMENT ON INDEX idx_expenses_user_billable IS 'Optimize queries for billable expenses';
COMMENT ON INDEX idx_email_logs_user_created_at IS 'Optimize recent activity queries';