-- =====================================================
-- Booklite Database Schema - Row Level Security (RLS)
-- PostgreSQL/Supabase Implementation
-- =====================================================
-- Description: RLS policies for multi-tenant data isolation
-- Dependencies: 01_schema_core.sql
-- Version: 1.0
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE number_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_copies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER_PROFILES POLICIES
-- =====================================================

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- CLIENTS POLICIES
-- =====================================================

CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clients" ON clients
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- PROJECTS POLICIES
-- =====================================================

CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- DOCUMENTS POLICIES
-- =====================================================

CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own documents" ON documents
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own documents" ON documents
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own documents" ON documents
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- DOCUMENT_LINE_ITEMS POLICIES
-- =====================================================

CREATE POLICY "Users can view own line items" ON document_line_items
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own line items" ON document_line_items
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own line items" ON document_line_items
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own line items" ON document_line_items
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payments" ON payments
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payments" ON payments
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own payments" ON payments
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- EXPENSES POLICIES
-- =====================================================

CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own expenses" ON expenses
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own expenses" ON expenses
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- CATEGORIES POLICIES
-- =====================================================

CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- ATTACHMENTS POLICIES
-- =====================================================

CREATE POLICY "Users can view own attachments" ON attachments
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own attachments" ON attachments
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attachments" ON attachments
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own attachments" ON attachments
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- EMAIL_LOGS POLICIES
-- =====================================================

CREATE POLICY "Users can view own email logs" ON email_logs
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own email logs" ON email_logs
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own email logs" ON email_logs
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own email logs" ON email_logs
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- NUMBER_SEQUENCES POLICIES
-- =====================================================

CREATE POLICY "Users can view own sequences" ON number_sequences
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sequences" ON number_sequences
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sequences" ON number_sequences
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own sequences" ON number_sequences
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- NOTES POLICIES
-- =====================================================

CREATE POLICY "Users can view own notes" ON notes
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notes" ON notes
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notes" ON notes
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notes" ON notes
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- TAX_RATES POLICIES
-- =====================================================

CREATE POLICY "Users can view own tax rates" ON tax_rates
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own tax rates" ON tax_rates
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tax rates" ON tax_rates
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own tax rates" ON tax_rates
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- OFFICIAL_COPIES POLICIES
-- =====================================================

CREATE POLICY "Users can view own official copies" ON official_copies
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own official copies" ON official_copies
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own official copies" ON official_copies
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own official copies" ON official_copies
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- STORAGE POLICIES (for Supabase Storage)
-- =====================================================

-- Note: These are example storage policies for Supabase Storage buckets
-- Actual implementation depends on your storage bucket configuration

-- Receipts bucket policy
-- CREATE POLICY "Users can upload own receipts"
--     ON storage.objects FOR INSERT
--     WITH CHECK (
--         bucket_id = 'receipts' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Users can view own receipts"
--     ON storage.objects FOR SELECT
--     USING (
--         bucket_id = 'receipts' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- PDFs bucket policy
-- CREATE POLICY "Users can upload own PDFs"
--     ON storage.objects FOR INSERT
--     WITH CHECK (
--         bucket_id = 'pdfs' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Users can view own PDFs"
--     ON storage.objects FOR SELECT
--     USING (
--         bucket_id = 'pdfs' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- Logos bucket policy
-- CREATE POLICY "Users can upload own logos"
--     ON storage.objects FOR INSERT
--     WITH CHECK (
--         bucket_id = 'logos' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Users can view own logos"
--     ON storage.objects FOR SELECT
--     USING (
--         bucket_id = 'logos' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Users can view own profile" ON user_profiles IS 'Allow users to view their own profile';
COMMENT ON POLICY "Users can view own clients" ON clients IS 'Allow users to view their own clients';
COMMENT ON POLICY "Users can view own projects" ON projects IS 'Allow users to view their own projects';
COMMENT ON POLICY "Users can view own documents" ON documents IS 'Allow users to view their own documents';
COMMENT ON POLICY "Users can view own line items" ON document_line_items IS 'Allow users to view their own line items';
COMMENT ON POLICY "Users can view own payments" ON payments IS 'Allow users to view their own payments';
COMMENT ON POLICY "Users can view own expenses" ON expenses IS 'Allow users to view their own expenses';
COMMENT ON POLICY "Users can view own categories" ON categories IS 'Allow users to view their own categories';
COMMENT ON POLICY "Users can view own attachments" ON attachments IS 'Allow users to view their own attachments';
COMMENT ON POLICY "Users can view own email logs" ON email_logs IS 'Allow users to view their own email logs';
COMMENT ON POLICY "Users can view own sequences" ON number_sequences IS 'Allow users to view their own number sequences';
COMMENT ON POLICY "Users can view own notes" ON notes IS 'Allow users to view their own notes';
COMMENT ON POLICY "Users can view own tax rates" ON tax_rates IS 'Allow users to view their own tax rates';
COMMENT ON POLICY "Users can view own official copies" ON official_copies IS 'Allow users to view their own official copies';