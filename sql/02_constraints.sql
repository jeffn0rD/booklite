-- =====================================================
-- Booklite Database Schema - Constraints
-- PostgreSQL/Supabase Implementation
-- =====================================================
-- Description: Foreign keys, unique constraints, and cross-table validations
-- Dependencies: 01_schema_core.sql
-- Version: 1.0
-- =====================================================

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- User Profiles
ALTER TABLE user_profiles
    ADD CONSTRAINT fk_user_profiles_logo 
    FOREIGN KEY (logo_attachment_id) 
    REFERENCES attachments(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE user_profiles
    ADD CONSTRAINT fk_user_profiles_default_tax_rate 
    FOREIGN KEY (default_tax_rate_id) 
    REFERENCES tax_rates(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

-- Clients
ALTER TABLE clients
    ADD CONSTRAINT fk_clients_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE clients
    ADD CONSTRAINT fk_clients_default_tax_rate 
    FOREIGN KEY (default_tax_rate_id) 
    REFERENCES tax_rates(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

-- Projects
ALTER TABLE projects
    ADD CONSTRAINT fk_projects_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE projects
    ADD CONSTRAINT fk_projects_client 
    FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE projects
    ADD CONSTRAINT fk_projects_origin_quote 
    FOREIGN KEY (origin_quote_id) 
    REFERENCES documents(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

-- Documents
ALTER TABLE documents
    ADD CONSTRAINT fk_documents_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE documents
    ADD CONSTRAINT fk_documents_client 
    FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE documents
    ADD CONSTRAINT fk_documents_project 
    FOREIGN KEY (project_id) 
    REFERENCES projects(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

-- Document Line Items
ALTER TABLE document_line_items
    ADD CONSTRAINT fk_line_items_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE document_line_items
    ADD CONSTRAINT fk_line_items_document 
    FOREIGN KEY (document_id) 
    REFERENCES documents(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- Payments
ALTER TABLE payments
    ADD CONSTRAINT fk_payments_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE payments
    ADD CONSTRAINT fk_payments_invoice 
    FOREIGN KEY (invoice_id) 
    REFERENCES documents(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- Expenses
ALTER TABLE expenses
    ADD CONSTRAINT fk_expenses_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE expenses
    ADD CONSTRAINT fk_expenses_category 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE expenses
    ADD CONSTRAINT fk_expenses_project 
    FOREIGN KEY (project_id) 
    REFERENCES projects(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE expenses
    ADD CONSTRAINT fk_expenses_receipt 
    FOREIGN KEY (receipt_attachment_id) 
    REFERENCES attachments(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE expenses
    ADD CONSTRAINT fk_expenses_linked_invoice 
    FOREIGN KEY (linked_invoice_id) 
    REFERENCES documents(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

-- Categories
ALTER TABLE categories
    ADD CONSTRAINT fk_categories_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

-- Attachments
ALTER TABLE attachments
    ADD CONSTRAINT fk_attachments_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

-- Email Logs
ALTER TABLE email_logs
    ADD CONSTRAINT fk_email_logs_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE email_logs
    ADD CONSTRAINT fk_email_logs_document 
    FOREIGN KEY (document_id) 
    REFERENCES documents(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- Number Sequences
ALTER TABLE number_sequences
    ADD CONSTRAINT fk_number_sequences_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

-- Notes
ALTER TABLE notes
    ADD CONSTRAINT fk_notes_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tax Rates
ALTER TABLE tax_rates
    ADD CONSTRAINT fk_tax_rates_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

-- Official Copies
ALTER TABLE official_copies
    ADD CONSTRAINT fk_official_copies_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE official_copies
    ADD CONSTRAINT fk_official_copies_document 
    FOREIGN KEY (document_id) 
    REFERENCES documents(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE official_copies
    ADD CONSTRAINT fk_official_copies_pdf 
    FOREIGN KEY (pdf_attachment_id) 
    REFERENCES attachments(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- =====================================================
-- UNIQUE CONSTRAINTS
-- =====================================================

-- Clients: unique name per user
ALTER TABLE clients
    ADD CONSTRAINT uq_clients_user_name 
    UNIQUE (user_id, name);

-- Projects: unique name per client (optional - can be enabled if needed)
-- ALTER TABLE projects
--     ADD CONSTRAINT uq_projects_client_name 
--     UNIQUE (user_id, client_id, name);

-- Documents: unique number per user/type (when number is not null)
CREATE UNIQUE INDEX uq_documents_user_type_number 
    ON documents (user_id, type, number) 
    WHERE number IS NOT NULL;

-- Categories: unique name per user
ALTER TABLE categories
    ADD CONSTRAINT uq_categories_user_name 
    UNIQUE (user_id, name);

-- Tax Rates: unique name per user
ALTER TABLE tax_rates
    ADD CONSTRAINT uq_tax_rates_user_name 
    UNIQUE (user_id, name);

-- Tax Rates: only one default per user (partial unique index)
CREATE UNIQUE INDEX uq_tax_rates_user_default 
    ON tax_rates (user_id) 
    WHERE is_default = true;

-- Number Sequences: unique type per user
ALTER TABLE number_sequences
    ADD CONSTRAINT uq_number_sequences_user_type 
    UNIQUE (user_id, type);

-- Attachments: unique path per user/bucket
ALTER TABLE attachments
    ADD CONSTRAINT uq_attachments_user_bucket_path 
    UNIQUE (user_id, bucket, path);

-- Official Copies: unique document (latest copy)
ALTER TABLE official_copies
    ADD CONSTRAINT uq_official_copies_document 
    UNIQUE (user_id, document_id);

-- =====================================================
-- ADDITIONAL CHECK CONSTRAINTS
-- =====================================================

-- Following is not valid due to sub query in constraint
-- This constraint is already enforced via trg_validate_same_user_payment_invoice
-- Payments: must reference invoice type documents
--ALTER TABLE payments
--    ADD CONSTRAINT chk_payments_invoice_type 
--    CHECK (
--        EXISTS (
--            SELECT 1 FROM documents 
--            WHERE documents.id = payments.invoice_id 
--            AND documents.type = 'invoice'
--        )
--    ) NOT VALID;
--
-------------------------------------------------------------------
-------------------------------------------------------------------

-- Expenses: linked_invoice_id required when billing_status = 'billed'
ALTER TABLE expenses
    ADD CONSTRAINT chk_expenses_billed_has_invoice 
    CHECK (
        billing_status != 'billed' OR linked_invoice_id IS NOT NULL
    );

-- Invalid due to subquery in constraint
-- Expenses: linked_invoice_id must be invoice type
-- replaced with trg_chk_expenses_linked_invoice
--
--ALTER TABLE expenses
--    ADD CONSTRAINT chk_expenses_linked_invoice_type 
--    CHECK (
--        linked_invoice_id IS NULL OR
--        EXISTS (
--            SELECT 1 FROM documents 
--            WHERE documents.id = expenses.linked_invoice_id 
--            AND documents.type = 'invoice'
--        )
--    ) NOT VALID;
--

-- Documents: cannot archive unpaid invoices
ALTER TABLE documents
    ADD CONSTRAINT chk_documents_archive_paid_only 
    CHECK (
        archived_at IS NULL OR 
        type != 'invoice' OR 
        status IN ('Paid', 'Void')
    );

-- Documents: issue_date required for finalized/sent documents
ALTER TABLE documents
    ADD CONSTRAINT chk_documents_issue_date_required 
    CHECK (
        (sent_at IS NULL AND finalized_at IS NULL) OR 
        issue_date IS NOT NULL
    );

-- invalid subquery in constraint
-- replaced with trg__projects_origin_quote_type
-- Projects: origin_quote_id must be quote type
--ALTER TABLE projects
--    ADD CONSTRAINT chk_projects_origin_quote_type 
--    CHECK (
--        origin_quote_id IS NULL OR
--        EXISTS (
--            SELECT 1 FROM documents 
--            WHERE documents.id = projects.origin_quote_id 
--            AND documents.type = 'quote'
--        )
--    ) NOT VALID;

-- =====================================================
-- SAME-USER VALIDATION FUNCTIONS
-- =====================================================
-- These functions ensure cross-table foreign keys share the same user_id

CREATE OR REPLACE FUNCTION validate_same_user_client_project()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM clients 
        WHERE clients.id = NEW.client_id 
        AND clients.user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'Project client_id must belong to the same user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_same_user_client_project
    BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION validate_same_user_client_project();

CREATE OR REPLACE FUNCTION validate_same_user_document_client()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM clients 
        WHERE clients.id = NEW.client_id 
        AND clients.user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'Document client_id must belong to the same user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_same_user_document_client
    BEFORE INSERT OR UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION validate_same_user_document_client();

CREATE OR REPLACE FUNCTION validate_same_user_document_project()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.project_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = NEW.project_id 
        AND projects.user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'Document project_id must belong to the same user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_same_user_document_project
    BEFORE INSERT OR UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION validate_same_user_document_project();

CREATE OR REPLACE FUNCTION validate_same_user_line_item_document()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM documents 
        WHERE documents.id = NEW.document_id 
        AND documents.user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'Line item document_id must belong to the same user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_same_user_line_item_document
    BEFORE INSERT OR UPDATE ON document_line_items
    FOR EACH ROW
    EXECUTE FUNCTION validate_same_user_line_item_document();

CREATE OR REPLACE FUNCTION validate_same_user_payment_invoice()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM documents 
        WHERE documents.id = NEW.invoice_id 
        AND documents.user_id = NEW.user_id
        AND documents.type = 'invoice'
    ) THEN
        RAISE EXCEPTION 'Payment invoice_id must belong to the same user and be an invoice';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_same_user_payment_invoice
    BEFORE INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION validate_same_user_payment_invoice();

-------------------------------------------------------------
-- Expenses: linked_invoice_id must be invoice type
--
CREATE OR REPLACE FUNCTION enforce_expenses_linked_invoice_type()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW.linked_invoice_id IS NOT NULL THEN
		IF NOT EXISTS (
			SELECT 1 FROM documents d
			WHERE d.id = NEW.linked_invoice_id
			AND d.type = 'invoice'
			AND d.user_id = NEW.user_id
		) THEN
			RAISE EXCEPTION 'Expenses.linked_invoice_id must reference an invoice document of the same user';
		END IF;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_chk_expenses_linked_invoice
BEFORE INSERT OR UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION enforce_expenses_linked_invoice_type();

-- Projects: origin_quote_id must be quote type
CREATE OR REPLACE FUNCTION enforce_projects_origin_quote_type()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW.origin_quote_id IS NOT NULL THEN
		IF NOT EXISTS (
			SELECT 1 FROM documents d
			WHERE d.id = NEW.origin_quote_id
			AND d.type = 'quote'
			AND d.user_id = NEW.user_id
		) THEN
			RAISE EXCEPTION 'Projects.origin_quote_id must reference a quote document of the same user';
		END IF;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg__projects_origin_quote_type
BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION enforce_projects_origin_quote_type();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON CONSTRAINT uq_clients_user_name ON clients IS 'Ensure unique client names per user';
COMMENT ON CONSTRAINT uq_categories_user_name ON categories IS 'Ensure unique category names per user';
COMMENT ON CONSTRAINT uq_tax_rates_user_name ON tax_rates IS 'Ensure unique tax rate names per user';
COMMENT ON CONSTRAINT uq_number_sequences_user_type ON number_sequences IS 'One sequence per type per user';
COMMENT ON CONSTRAINT uq_attachments_user_bucket_path ON attachments IS 'Unique file paths per user/bucket';
COMMENT ON CONSTRAINT uq_official_copies_document ON official_copies IS 'One official copy per document';