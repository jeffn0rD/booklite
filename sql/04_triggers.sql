-- =====================================================
-- Booklite Database Schema - Triggers
-- PostgreSQL/Supabase Implementation
-- =====================================================
-- Description: Triggers for derived fields, business logic, and data integrity
-- Dependencies: 01_schema_core.sql, 02_constraints.sql
-- Version: 1.0
-- =====================================================

-- =====================================================
-- UPDATED_AT TIMESTAMP TRIGGERS
-- =====================================================

-- Generic function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_line_items_updated_at
    BEFORE UPDATE ON document_line_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_number_sequences_updated_at
    BEFORE UPDATE ON number_sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DOCUMENT LINE ITEM CALCULATIONS
-- =====================================================

-- Calculate line item totals before insert/update
CREATE OR REPLACE FUNCTION calculate_line_item_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate line subtotal (quantity * unit_price_cents)
    NEW.line_subtotal_cents := ROUND(NEW.quantity * NEW.unit_price_cents);
    
    -- Calculate tax amount if tax rate is provided
    IF NEW.tax_rate_percent IS NOT NULL THEN
        NEW.tax_amount_cents := ROUND(NEW.line_subtotal_cents * NEW.tax_rate_percent / 100);
    ELSE
        NEW.tax_amount_cents := 0;
    END IF;
    
    -- Calculate line total
    NEW.line_total_cents := NEW.line_subtotal_cents + NEW.tax_amount_cents;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_line_item_totals
    BEFORE INSERT OR UPDATE ON document_line_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_line_item_totals();

-- =====================================================
-- DOCUMENT TOTALS RECALCULATION
-- =====================================================

-- Recalculate document totals when line items change
CREATE OR REPLACE FUNCTION recalculate_document_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_document_id bigint;
    v_subtotal_cents int;
    v_tax_total_cents int;
    v_total_cents int;
BEGIN
    -- Determine which document to update
    IF TG_OP = 'DELETE' THEN
        v_document_id := OLD.document_id;
    ELSE
        v_document_id := NEW.document_id;
    END IF;
    
    -- Calculate totals from line items
    SELECT 
        COALESCE(SUM(line_subtotal_cents), 0),
        COALESCE(SUM(tax_amount_cents), 0),
        COALESCE(SUM(line_total_cents), 0)
    INTO 
        v_subtotal_cents,
        v_tax_total_cents,
        v_total_cents
    FROM document_line_items
    WHERE document_id = v_document_id;
    
    -- Update document totals
    UPDATE documents
    SET 
        subtotal_cents = v_subtotal_cents,
        tax_total_cents = v_tax_total_cents,
        total_cents = v_total_cents,
        balance_due_cents = v_total_cents - amount_paid_cents
    WHERE id = v_document_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalculate_document_totals_insert
    AFTER INSERT ON document_line_items
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_document_totals();

CREATE TRIGGER trg_recalculate_document_totals_update
    AFTER UPDATE ON document_line_items
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_document_totals();

CREATE TRIGGER trg_recalculate_document_totals_delete
    AFTER DELETE ON document_line_items
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_document_totals();

-- =====================================================
-- PAYMENT TRACKING AND INVOICE STATUS
-- =====================================================

-- Update invoice paid amounts and status when payments change
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    v_invoice_id bigint;
    v_total_paid int;
    v_total_cents int;
    v_new_status text;
BEGIN
    -- Determine which invoice to update
    IF TG_OP = 'DELETE' THEN
        v_invoice_id := OLD.invoice_id;
    ELSE
        v_invoice_id := NEW.invoice_id;
    END IF;
    
    -- Calculate total payments
    SELECT COALESCE(SUM(amount_cents), 0)
    INTO v_total_paid
    FROM payments
    WHERE invoice_id = v_invoice_id;
    
    -- Get invoice total
    SELECT total_cents
    INTO v_total_cents
    FROM documents
    WHERE id = v_invoice_id;
    
    -- Determine new status
    IF v_total_paid = 0 THEN
        v_new_status := 'Unpaid';
    ELSIF v_total_paid >= v_total_cents THEN
        v_new_status := 'Paid';
    ELSE
        v_new_status := 'Partial';
    END IF;
    
    -- Update invoice
    UPDATE documents
    SET 
        amount_paid_cents = v_total_paid,
        balance_due_cents = v_total_cents - v_total_paid,
        status = CASE 
            WHEN status = 'Void' THEN 'Void'  -- Don't change Void status
            WHEN status = 'Draft' THEN 'Draft'  -- Don't change Draft status
            ELSE v_new_status
        END
    WHERE id = v_invoice_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_invoice_payment_status_insert
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_payment_status();

CREATE TRIGGER trg_update_invoice_payment_status_update
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_payment_status();

CREATE TRIGGER trg_update_invoice_payment_status_delete
    AFTER DELETE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_payment_status();

-- =====================================================
-- PO NUMBER INHERITANCE
-- =====================================================

-- Inherit PO number from project when document is created
CREATE OR REPLACE FUNCTION inherit_po_number()
RETURNS TRIGGER AS $$
DECLARE
    v_default_po varchar(50);
BEGIN
    -- Only inherit if po_number is null and project_id is set
    IF NEW.po_number IS NULL AND NEW.project_id IS NOT NULL THEN
        SELECT default_po_number
        INTO v_default_po
        FROM projects
        WHERE id = NEW.project_id;
        
        NEW.po_number := v_default_po;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inherit_po_number
    BEFORE INSERT ON documents
    FOR EACH ROW
    EXECUTE FUNCTION inherit_po_number();

-- =====================================================
-- DOCUMENT NUMBER ASSIGNMENT
-- =====================================================

-- Assign document number from sequence when finalizing
CREATE OR REPLACE FUNCTION assign_document_number()
RETURNS TRIGGER AS $$
DECLARE
    v_sequence_record RECORD;
    v_next_value int;
    v_new_number text;
BEGIN
    -- Only assign number if it's null and document is being finalized
    IF NEW.number IS NULL AND NEW.finalized_at IS NOT NULL AND OLD.finalized_at IS NULL THEN
        -- Lock and get sequence record
        SELECT * INTO v_sequence_record
        FROM number_sequences
        WHERE user_id = NEW.user_id AND type = NEW.type
        FOR UPDATE;
        
        -- If sequence doesn't exist, create it with defaults
        IF NOT FOUND THEN
            INSERT INTO number_sequences (user_id, type, prefix, current_value, padding)
            VALUES (
                NEW.user_id,
                NEW.type,
                CASE NEW.type 
                    WHEN 'quote' THEN 'Q-'
                    WHEN 'invoice' THEN 'INV-'
                END,
                0,
                4
            )
            RETURNING * INTO v_sequence_record;
        END IF;
        
        -- Increment sequence
        v_next_value := v_sequence_record.current_value + 1;
        
        -- Update sequence
        UPDATE number_sequences
        SET current_value = v_next_value
        WHERE id = v_sequence_record.id;
        
        -- Format number with padding
        v_new_number := v_sequence_record.prefix || lpad(v_next_value::text, v_sequence_record.padding, '0');
        
        NEW.number := v_new_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_document_number
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION assign_document_number();

-- =====================================================
-- QUOTE EXPIRY CHECK
-- =====================================================

-- Mark quotes as expired when expiry_date passes
CREATE OR REPLACE FUNCTION check_quote_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'quote' 
       AND NEW.expiry_date IS NOT NULL 
       AND NEW.expiry_date < CURRENT_DATE
       AND NEW.accepted_at IS NULL
       AND NEW.status NOT IN ('Expired', 'Accepted') THEN
        NEW.status := 'Expired';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_quote_expiry
    BEFORE UPDATE ON documents
    FOR EACH ROW
    WHEN (NEW.type = 'quote')
    EXECUTE FUNCTION check_quote_expiry();

-- =====================================================
-- EXPENSE BILLING STATUS VALIDATION
-- =====================================================

-- Ensure expense billing_status and linked_invoice_id are synchronized
CREATE OR REPLACE FUNCTION validate_expense_billing()
RETURNS TRIGGER AS $$
BEGIN
    -- If billing_status is 'billed', linked_invoice_id must be set
    IF NEW.billing_status = 'billed' AND NEW.linked_invoice_id IS NULL THEN
        RAISE EXCEPTION 'Expense with billing_status "billed" must have linked_invoice_id';
    END IF;
    
    -- If linked_invoice_id is set, billing_status should be 'billed' or 'user_paid'
    IF NEW.linked_invoice_id IS NOT NULL AND NEW.billing_status = 'unbilled' THEN
        NEW.billing_status := 'billed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_expense_billing
    BEFORE INSERT OR UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION validate_expense_billing();

-- =====================================================
-- DOCUMENT STATUS TRANSITION VALIDATION
-- =====================================================

-- Validate document status transitions
CREATE OR REPLACE FUNCTION validate_document_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent changing status from Void
    IF OLD.status = 'Void' AND NEW.status != 'Void' THEN
        RAISE EXCEPTION 'Cannot change status from Void';
    END IF;
    
    -- For invoices: ensure sent_at is set when status changes to Sent
    IF NEW.type = 'invoice' AND NEW.status = 'Sent' AND NEW.sent_at IS NULL THEN
        NEW.sent_at := now();
    END IF;
    
    -- For quotes: ensure sent_at is set when status changes to Sent
    IF NEW.type = 'quote' AND NEW.status = 'Sent' AND NEW.sent_at IS NULL THEN
        NEW.sent_at := now();
    END IF;
    
    -- For quotes: ensure accepted_at is set when status changes to Accepted
    IF NEW.type = 'quote' AND NEW.status = 'Accepted' AND NEW.accepted_at IS NULL THEN
        NEW.accepted_at := now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_document_status_transition
    BEFORE UPDATE ON documents
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION validate_document_status_transition();

-- =====================================================
-- BALANCE DUE CALCULATION
-- =====================================================

-- Ensure balance_due_cents is always calculated correctly
CREATE OR REPLACE FUNCTION calculate_balance_due()
RETURNS TRIGGER AS $$
BEGIN
    NEW.balance_due_cents := NEW.total_cents - NEW.amount_paid_cents;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_balance_due
    BEFORE INSERT OR UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION calculate_balance_due();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically update updated_at timestamp on row modification';
COMMENT ON FUNCTION calculate_line_item_totals() IS 'Calculate line item subtotal, tax, and total amounts';
COMMENT ON FUNCTION recalculate_document_totals() IS 'Recalculate document totals when line items change';
COMMENT ON FUNCTION update_invoice_payment_status() IS 'Update invoice payment amounts and status based on payments';
COMMENT ON FUNCTION inherit_po_number() IS 'Inherit PO number from project when creating document';
COMMENT ON FUNCTION assign_document_number() IS 'Assign sequential document number when finalizing';
COMMENT ON FUNCTION check_quote_expiry() IS 'Mark quotes as expired when expiry_date passes';
COMMENT ON FUNCTION validate_expense_billing() IS 'Ensure expense billing_status and linked_invoice_id are synchronized';
COMMENT ON FUNCTION validate_document_status_transition() IS 'Validate and enforce document status transitions';
COMMENT ON FUNCTION calculate_balance_due() IS 'Calculate balance_due_cents from total and paid amounts';