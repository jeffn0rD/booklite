-- =====================================================
-- Booklite Database Schema - Rollback Migration (DOWN)
-- PostgreSQL/Supabase Implementation
-- =====================================================
-- Description: Rollback script to remove all database objects
-- Version: 1.0
-- WARNING: This will delete all data and schema objects!
-- =====================================================

-- Start transaction
BEGIN;

--\echo 'WARNING: This will delete all Booklite database objects and data!'
--\echo 'Press Ctrl+C within 5 seconds to cancel...'
SELECT pg_sleep(5);

-- =====================================================
-- DROP RLS POLICIES
-- =====================================================
--\echo 'Dropping RLS policies...'

-- User Profiles
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Clients
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can view own clients" ON clients;

-- Projects
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;

-- Documents
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can view own documents" ON documents;

-- Document Line Items
DROP POLICY IF EXISTS "Users can delete own line items" ON document_line_items;
DROP POLICY IF EXISTS "Users can update own line items" ON document_line_items;
DROP POLICY IF EXISTS "Users can insert own line items" ON document_line_items;
DROP POLICY IF EXISTS "Users can view own line items" ON document_line_items;

-- Payments
DROP POLICY IF EXISTS "Users can delete own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;

-- Expenses
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;

-- Categories
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can view own categories" ON categories;

-- Attachments
DROP POLICY IF EXISTS "Users can delete own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can update own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can insert own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can view own attachments" ON attachments;

-- Email Logs
DROP POLICY IF EXISTS "Users can delete own email logs" ON email_logs;
DROP POLICY IF EXISTS "Users can update own email logs" ON email_logs;
DROP POLICY IF EXISTS "Users can insert own email logs" ON email_logs;
DROP POLICY IF EXISTS "Users can view own email logs" ON email_logs;

-- Number Sequences
DROP POLICY IF EXISTS "Users can delete own sequences" ON number_sequences;
DROP POLICY IF EXISTS "Users can update own sequences" ON number_sequences;
DROP POLICY IF EXISTS "Users can insert own sequences" ON number_sequences;
DROP POLICY IF EXISTS "Users can view own sequences" ON number_sequences;

-- Notes
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can view own notes" ON notes;

-- Tax Rates
DROP POLICY IF EXISTS "Users can delete own tax rates" ON tax_rates;
DROP POLICY IF EXISTS "Users can update own tax rates" ON tax_rates;
DROP POLICY IF EXISTS "Users can insert own tax rates" ON tax_rates;
DROP POLICY IF EXISTS "Users can view own tax rates" ON tax_rates;

-- Official Copies
DROP POLICY IF EXISTS "Users can delete own official copies" ON official_copies;
DROP POLICY IF EXISTS "Users can update own official copies" ON official_copies;
DROP POLICY IF EXISTS "Users can insert own official copies" ON official_copies;
DROP POLICY IF EXISTS "Users can view own official copies" ON official_copies;

-- =====================================================
-- DROP TRIGGERS
-- =====================================================
--\echo 'Dropping triggers...'

DROP TRIGGER IF EXISTS trg_calculate_balance_due ON documents;
DROP TRIGGER IF EXISTS trg_validate_document_status_transition ON documents;
DROP TRIGGER IF EXISTS trg_validate_expense_billing ON expenses;
DROP TRIGGER IF EXISTS trg_check_quote_expiry ON documents;
DROP TRIGGER IF EXISTS trg_assign_document_number ON documents;
DROP TRIGGER IF EXISTS trg_inherit_po_number ON documents;
DROP TRIGGER IF EXISTS trg_update_invoice_payment_status_delete ON payments;
DROP TRIGGER IF EXISTS trg_update_invoice_payment_status_update ON payments;
DROP TRIGGER IF EXISTS trg_update_invoice_payment_status_insert ON payments;
DROP TRIGGER IF EXISTS trg_recalculate_document_totals_delete ON document_line_items;
DROP TRIGGER IF EXISTS trg_recalculate_document_totals_update ON document_line_items;
DROP TRIGGER IF EXISTS trg_recalculate_document_totals_insert ON document_line_items;
DROP TRIGGER IF EXISTS trg_calculate_line_item_totals ON document_line_items;
DROP TRIGGER IF EXISTS trg_number_sequences_updated_at ON number_sequences;
DROP TRIGGER IF EXISTS trg_expenses_updated_at ON expenses;
DROP TRIGGER IF EXISTS trg_line_items_updated_at ON document_line_items;
DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;

-- Same-user validation triggers
DROP TRIGGER IF EXISTS trg_validate_same_user_payment_invoice ON payments;
DROP TRIGGER IF EXISTS trg_validate_same_user_line_item_document ON document_line_items;
DROP TRIGGER IF EXISTS trg_validate_same_user_document_project ON documents;
DROP TRIGGER IF EXISTS trg_validate_same_user_document_client ON documents;
DROP TRIGGER IF EXISTS trg_validate_same_user_client_project ON projects;

-- =====================================================
-- DROP FUNCTIONS
-- =====================================================
--\echo 'Dropping functions...'

DROP FUNCTION IF EXISTS calculate_balance_due();
DROP FUNCTION IF EXISTS validate_document_status_transition();
DROP FUNCTION IF EXISTS validate_expense_billing();
DROP FUNCTION IF EXISTS check_quote_expiry();
DROP FUNCTION IF EXISTS assign_document_number();
DROP FUNCTION IF EXISTS inherit_po_number();
DROP FUNCTION IF EXISTS update_invoice_payment_status();
DROP FUNCTION IF EXISTS recalculate_document_totals();
DROP FUNCTION IF EXISTS calculate_line_item_totals();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS validate_same_user_payment_invoice();
DROP FUNCTION IF EXISTS validate_same_user_line_item_document();
DROP FUNCTION IF EXISTS validate_same_user_document_project();
DROP FUNCTION IF EXISTS validate_same_user_document_client();
DROP FUNCTION IF EXISTS validate_same_user_client_project();

-- =====================================================
-- DROP TABLES (in reverse dependency order)
-- =====================================================
--\echo 'Dropping tables...'

DROP TABLE IF EXISTS official_copies CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS document_line_items CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tax_rates CASCADE;
DROP TABLE IF EXISTS number_sequences CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- =====================================================
-- DROP EXTENSIONS (if they were created by this migration)
--=====================================================
-- Note: Only drop if no other schemas are using these extensions
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- Commit transaction
COMMIT;

--\echo 'Rollback completed successfully!'
--\echo 'All Booklite database objects have been removed.'