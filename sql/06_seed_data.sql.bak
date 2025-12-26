-- =====================================================
-- Booklite Database Schema - Seed Data
-- PostgreSQL/Supabase Implementation
-- =====================================================
-- Description: Initial test data with realistic examples
-- Dependencies: All previous migration files
-- Version: 1.0
-- =====================================================

-- Note: This seed data assumes test users exist in auth.users
-- Replace the UUIDs below with actual user IDs from your Supabase auth.users table

-- =====================================================
-- TEST USER IDs (Replace with actual UUIDs)
-- =====================================================
-- User 1: '00000000-0000-0000-0000-000000000001'
-- User 2: '00000000-0000-0000-0000-000000000002'
-- User 3: '00000000-0000-0000-0000-000000000003'

-- =====================================================
-- TAX RATES
-- =====================================================
INSERT INTO tax_rates (user_id, name, rate_percent, is_default) VALUES
-- User 1 tax rates
('00000000-0000-0000-0000-000000000001', 'Standard VAT', 20.0000, true),
('00000000-0000-0000-0000-000000000001', 'Reduced VAT', 5.0000, false),
('00000000-0000-0000-0000-000000000001', 'Zero Rate', 0.0000, false),

-- User 2 tax rates
('00000000-0000-0000-0000-000000000002', 'Sales Tax', 8.5000, true),
('00000000-0000-0000-0000-000000000002', 'No Tax', 0.0000, false),

-- User 3 tax rates
('00000000-0000-0000-0000-000000000003', 'GST', 10.0000, true),
('00000000-0000-0000-0000-000000000003', 'PST', 7.0000, false);

-- =====================================================
-- CATEGORIES
-- =====================================================
INSERT INTO categories (user_id, name, description) VALUES
-- User 1 categories
('00000000-0000-0000-0000-000000000001', 'Software & Tools', 'Software licenses and development tools'),
('00000000-0000-0000-0000-000000000001', 'Travel', 'Business travel expenses'),
('00000000-0000-0000-0000-000000000001', 'Office Supplies', 'General office supplies and equipment'),
('00000000-0000-0000-0000-000000000001', 'Professional Services', 'Legal, accounting, and consulting fees'),

-- User 2 categories
('00000000-0000-0000-0000-000000000002', 'Marketing', 'Marketing and advertising expenses'),
('00000000-0000-0000-0000-000000000002', 'Equipment', 'Hardware and equipment purchases'),
('00000000-0000-0000-0000-000000000002', 'Subscriptions', 'Monthly service subscriptions'),

-- User 3 categories
('00000000-0000-0000-0000-000000000003', 'Training', 'Professional development and training'),
('00000000-0000-0000-0000-000000000003', 'Insurance', 'Business insurance premiums'),
('00000000-0000-0000-0000-000000000003', 'Utilities', 'Internet, phone, and utilities');

-- =====================================================
-- USER PROFILES
-- =====================================================
INSERT INTO user_profiles (
    user_id, business_name, legal_name, address_line1, city, region, 
    postal_code, country, tax_id, default_payment_terms_days,
    numbering_quote_prefix, numbering_invoice_prefix, numbering_padding
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'TechConsult Pro',
    'TechConsult Professional Services Ltd',
    '123 Innovation Drive',
    'London',
    'Greater London',
    'SW1A 1AA',
    'GB',
    'GB123456789',
    30,
    'Q-',
    'INV-',
    4
),
(
    '00000000-0000-0000-0000-000000000002',
    'Digital Solutions Inc',
    'Digital Solutions Incorporated',
    '456 Tech Boulevard',
    'San Francisco',
    'CA',
    '94102',
    'US',
    '12-3456789',
    15,
    'QT-',
    'INV-',
    5
),
(
    '00000000-0000-0000-0000-000000000003',
    'Creative Designs Studio',
    'Creative Designs Studio Pty Ltd',
    '789 Design Street',
    'Sydney',
    'NSW',
    '2000',
    'AU',
    'ABN 12 345 678 901',
    14,
    'QUOTE-',
    'INVOICE-',
    4
);

-- =====================================================
-- CLIENTS
-- =====================================================
INSERT INTO clients (
    user_id, name, email, billing_address, tax_vat_id, 
    default_payment_terms_days, default_currency
) VALUES
-- User 1 clients
(
    '00000000-0000-0000-0000-000000000001',
    'Acme Corporation',
    'accounts@acmecorp.com',
    '{"line1": "100 Business Park", "city": "Manchester", "region": "Greater Manchester", "postal_code": "M1 1AA", "country": "GB"}'::jsonb,
    'GB987654321',
    30,
    'USD'
),
(
    '00000000-0000-0000-0000-000000000001',
    'Global Tech Solutions',
    'billing@globaltech.com',
    '{"line1": "200 Tech Avenue", "city": "Birmingham", "region": "West Midlands", "postal_code": "B1 1AA", "country": "GB"}'::jsonb,
    'GB111222333',
    45,
    'USD'
),
(
    '00000000-0000-0000-0000-000000000001',
    'StartupXYZ',
    'finance@startupxyz.io',
    '{"line1": "50 Innovation Hub", "city": "London", "region": "Greater London", "postal_code": "EC1A 1BB", "country": "GB"}'::jsonb,
    NULL,
    15,
    'USD'
),

-- User 2 clients
(
    '00000000-0000-0000-0000-000000000002',
    'Enterprise Systems LLC',
    'ap@enterprisesys.com',
    '{"line1": "300 Corporate Drive", "city": "New York", "region": "NY", "postal_code": "10001", "country": "US"}'::jsonb,
    NULL,
    30,
    'USD'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Retail Innovations',
    'payments@retailinnovations.com',
    '{"line1": "400 Commerce Street", "city": "Los Angeles", "region": "CA", "postal_code": "90001", "country": "US"}'::jsonb,
    NULL,
    15,
    'USD'
),

-- User 3 clients
(
    '00000000-0000-0000-0000-000000000003',
    'Melbourne Marketing Group',
    'accounts@melbournemarketing.com.au',
    '{"line1": "500 Marketing Lane", "city": "Melbourne", "region": "VIC", "postal_code": "3000", "country": "AU"}'::jsonb,
    'ABN 98 765 432 109',
    30,
    'USD'
),
(
    '00000000-0000-0000-0000-000000000003',
    'Sydney Startups',
    'finance@sydneystartups.com.au',
    '{"line1": "600 Startup Way", "city": "Sydney", "region": "NSW", "postal_code": "2001", "country": "AU"}'::jsonb,
    NULL,
    14,
    'USD'
);

-- =====================================================
-- PROJECTS
-- =====================================================
INSERT INTO projects (
    user_id, client_id, name, status, default_po_number, notes
) VALUES
-- User 1 projects
(
    '00000000-0000-0000-0000-000000000001',
    1,
    'Website Redesign 2024',
    'Active',
    'PO-2024-001',
    'Complete website overhaul with modern design and improved UX'
),
(
    '00000000-0000-0000-0000-000000000001',
    1,
    'Mobile App Development',
    'Active',
    'PO-2024-002',
    'Native iOS and Android app development'
),
(
    '00000000-0000-0000-0000-000000000001',
    2,
    'Cloud Migration',
    'Active',
    'PO-GT-2024-15',
    'Migration of legacy systems to AWS cloud infrastructure'
),
(
    '00000000-0000-0000-0000-000000000001',
    3,
    'MVP Development',
    'Completed',
    NULL,
    'Initial MVP for product launch'
),

-- User 2 projects
(
    '00000000-0000-0000-0000-000000000002',
    4,
    'ERP System Integration',
    'Active',
    'PO-ES-2024-100',
    'Integration of new ERP system with existing infrastructure'
),
(
    '00000000-0000-0000-0000-000000000002',
    5,
    'E-commerce Platform',
    'Active',
    'PO-RI-2024-050',
    'Custom e-commerce solution with inventory management'
),

-- User 3 projects
(
    '00000000-0000-0000-0000-000000000003',
    6,
    'Brand Identity Refresh',
    'Active',
    'PO-MMG-2024-25',
    'Complete brand identity redesign including logo and marketing materials'
),
(
    '00000000-0000-0000-0000-000000000003',
    7,
    'Website Development',
    'Active',
    NULL,
    'New website with CMS integration'
);

-- =====================================================
-- NUMBER SEQUENCES
-- =====================================================
INSERT INTO number_sequences (user_id, type, prefix, current_value, padding) VALUES
('00000000-0000-0000-0000-000000000001', 'quote', 'Q-', 15, 4),
('00000000-0000-0000-0000-000000000001', 'invoice', 'INV-', 42, 4),
('00000000-0000-0000-0000-000000000002', 'quote', 'QT-', 8, 5),
('00000000-0000-0000-0000-000000000002', 'invoice', 'INV-', 23, 5),
('00000000-0000-0000-0000-000000000003', 'quote', 'QUOTE-', 12, 4),
('00000000-0000-0000-0000-000000000003', 'invoice', 'INVOICE-', 31, 4);

-- =====================================================
-- DOCUMENTS (Quotes and Invoices)
-- =====================================================
INSERT INTO documents (
    user_id, type, number, client_id, project_id, po_number,
    issue_date, due_date, expiry_date, public_notes, internal_notes,
    currency, subtotal_cents, tax_total_cents, total_cents,
    amount_paid_cents, balance_due_cents, status, sent_at, finalized_at
) VALUES
-- User 1 documents
(
    '00000000-0000-0000-0000-000000000001',
    'quote',
    'Q-0015',
    1,
    1,
    'PO-2024-001',
    '2024-01-15',
    NULL,
    '2024-02-15',
    'Thank you for considering our services. This quote is valid for 30 days.',
    'Client requested detailed breakdown of costs',
    'USD',
    1500000,
    300000,
    1800000,
    0,
    1800000,
    'Sent',
    '2024-01-15 10:30:00+00',
    '2024-01-15 10:30:00+00'
),
(
    '00000000-0000-0000-0000-000000000001',
    'invoice',
    'INV-0042',
    1,
    1,
    'PO-2024-001',
    '2024-02-01',
    '2024-03-03',
    NULL,
    'Payment terms: Net 30 days. Thank you for your business!',
    'First milestone payment for website redesign',
    'USD',
    2500000,
    500000,
    3000000,
    1500000,
    1500000,
    'Partial',
    '2024-02-01 09:00:00+00',
    '2024-02-01 09:00:00+00'
),
(
    '00000000-0000-0000-0000-000000000001',
    'invoice',
    'INV-0043',
    2,
    3,
    'PO-GT-2024-15',
    '2024-01-20',
    '2024-03-05',
    NULL,
    'Payment terms: Net 45 days.',
    'Cloud migration consulting - Phase 1',
    'USD',
    5000000,
    1000000,
    6000000,
    6000000,
    0,
    'Paid',
    '2024-01-20 14:00:00+00',
    '2024-01-20 14:00:00+00'
),

-- User 2 documents
(
    '00000000-0000-0000-0000-000000000002',
    'quote',
    'QT-00008',
    4,
    5,
    'PO-ES-2024-100',
    '2024-01-10',
    NULL,
    '2024-02-10',
    'Comprehensive ERP integration solution. Quote valid for 30 days.',
    'Complex integration requiring custom middleware',
    'USD',
    7500000,
    637500,
    8137500,
    0,
    8137500,
    'Accepted',
    '2024-01-10 11:00:00+00',
    '2024-01-10 11:00:00+00'
),
(
    '00000000-0000-0000-0000-000000000002',
    'invoice',
    'INV-00023',
    5,
    6,
    'PO-RI-2024-050',
    '2024-02-05',
    '2024-02-20',
    NULL,
    'Payment terms: Net 15 days. Early payment discount available.',
    'E-commerce platform development - Initial deposit',
    'USD',
    3000000,
    255000,
    3255000,
    0,
    3255000,
    'Unpaid',
    '2024-02-05 10:00:00+00',
    '2024-02-05 10:00:00+00'
),

-- User 3 documents
(
    '00000000-0000-0000-0000-000000000003',
    'quote',
    'QUOTE-0012',
    6,
    7,
    'PO-MMG-2024-25',
    '2024-01-25',
    NULL,
    '2024-02-25',
    'Brand identity package including logo design and style guide.',
    'Client wants 3 concept options',
    'USD',
    4500000,
    450000,
    4950000,
    0,
    4950000,
    'Sent',
    '2024-01-25 13:00:00+00',
    '2024-01-25 13:00:00+00'
),
(
    '00000000-0000-0000-0000-000000000003',
    'invoice',
    'INVOICE-0031',
    7,
    8,
    NULL,
    '2024-02-10',
    '2024-02-24',
    NULL,
    'Payment terms: Net 14 days.',
    'Website development - 50% deposit',
    'USD',
    2000000,
    200000,
    2200000,
    2200000,
    0,
    'Paid',
    '2024-02-10 15:00:00+00',
    '2024-02-10 15:00:00+00'
);

-- =====================================================
-- DOCUMENT LINE ITEMS
-- =====================================================
INSERT INTO document_line_items (
    user_id, document_id, position, description, quantity, unit,
    unit_price_cents, line_subtotal_cents, tax_rate_percent,
    tax_amount_cents, line_total_cents
) VALUES
-- Quote Q-0015 line items
(
    '00000000-0000-0000-0000-000000000001',
    1,
    1,
    'UI/UX Design - Homepage and 5 key pages',
    1.0000,
    'project',
    500000,
    500000,
    20.0000,
    100000,
    600000
),
(
    '00000000-0000-0000-0000-000000000001',
    1,
    2,
    'Frontend Development - Responsive implementation',
    80.0000,
    'hours',
    10000,
    800000,
    20.0000,
    160000,
    960000
),
(
    '00000000-0000-0000-0000-000000000001',
    1,
    3,
    'Content Migration and SEO Optimization',
    20.0000,
    'hours',
    10000,
    200000,
    20.0000,
    40000,
    240000
),

-- Invoice INV-0042 line items
(
    '00000000-0000-0000-0000-000000000001',
    2,
    1,
    'Website Redesign - Milestone 1: Design Phase',
    1.0000,
    'milestone',
    2500000,
    2500000,
    20.0000,
    500000,
    3000000
),

-- Invoice INV-0043 line items
(
    '00000000-0000-0000-0000-000000000001',
    3,
    1,
    'Cloud Architecture Assessment',
    40.0000,
    'hours',
    15000,
    600000,
    20.0000,
    120000,
    720000
),
(
    '00000000-0000-0000-0000-000000000001',
    3,
    2,
    'Migration Planning and Documentation',
    60.0000,
    'hours',
    12500,
    750000,
    20.0000,
    150000,
    900000
),
(
    '00000000-0000-0000-0000-000000000001',
    3,
    3,
    'Infrastructure Setup - AWS Services',
    1.0000,
    'project',
    3650000,
    3650000,
    20.0000,
    730000,
    4380000
),

-- Quote QT-00008 line items
(
    '00000000-0000-0000-0000-000000000002',
    4,
    1,
    'ERP System Analysis and Requirements Gathering',
    80.0000,
    'hours',
    15000,
    1200000,
    8.5000,
    102000,
    1302000
),
(
    '00000000-0000-0000-0000-000000000002',
    4,
    2,
    'Custom Middleware Development',
    200.0000,
    'hours',
    17500,
    3500000,
    8.5000,
    297500,
    3797500
),
(
    '00000000-0000-0000-0000-000000000002',
    4,
    3,
    'Integration Testing and Deployment',
    120.0000,
    'hours',
    15000,
    1800000,
    8.5000,
    153000,
    1953000
),
(
    '00000000-0000-0000-0000-000000000002',
    4,
    4,
    'Training and Documentation',
    100.0000,
    'hours',
    10000,
    1000000,
    8.5000,
    85000,
    1085000
),

-- Invoice INV-00023 line items
(
    '00000000-0000-0000-0000-000000000002',
    5,
    1,
    'E-commerce Platform Development - Initial Deposit (50%)',
    1.0000,
    'deposit',
    3000000,
    3000000,
    8.5000,
    255000,
    3255000
),

-- Quote QUOTE-0012 line items
(
    '00000000-0000-0000-0000-000000000003',
    6,
    1,
    'Brand Strategy and Research',
    1.0000,
    'project',
    1500000,
    1500000,
    10.0000,
    150000,
    1650000
),
(
    '00000000-0000-0000-0000-000000000003',
    6,
    2,
    'Logo Design - 3 Concepts with Revisions',
    1.0000,
    'project',
    2000000,
    2000000,
    10.0000,
    200000,
    2200000
),
(
    '00000000-0000-0000-0000-000000000003',
    6,
    3,
    'Brand Style Guide and Assets',
    1.0000,
    'project',
    1000000,
    1000000,
    10.0000,
    100000,
    1100000
),

-- Invoice INVOICE-0031 line items
(
    '00000000-0000-0000-0000-000000000003',
    7,
    1,
    'Website Development - 50% Deposit',
    1.0000,
    'deposit',
    2000000,
    2000000,
    10.0000,
    200000,
    2200000
);

-- =====================================================
-- PAYMENTS
-- =====================================================
INSERT INTO payments (
    user_id, invoice_id, date, amount_cents, method, reference
) VALUES
-- Payment for INV-0042 (partial)
(
    '00000000-0000-0000-0000-000000000001',
    2,
    '2024-02-15',
    1500000,
    'Bank Transfer',
    'TXN-20240215-001'
),

-- Payments for INV-0043 (full payment in 2 installments)
(
    '00000000-0000-0000-0000-000000000001',
    3,
    '2024-02-10',
    3000000,
    'Bank Transfer',
    'TXN-20240210-001'
),
(
    '00000000-0000-0000-0000-000000000001',
    3,
    '2024-02-25',
    3000000,
    'Bank Transfer',
    'TXN-20240225-001'
),

-- Payment for INVOICE-0031 (full payment)
(
    '00000000-0000-0000-0000-000000000003',
    7,
    '2024-02-12',
    2200000,
    'Credit Card',
    'CC-20240212-789'
);

-- =====================================================
-- EXPENSES
-- =====================================================
INSERT INTO expenses (
    user_id, date, vendor, category_id, project_id,
    total_amount_cents, tax_amount_cents, currency,
    notes, billable, billing_status
) VALUES
-- User 1 expenses
(
    '00000000-0000-0000-0000-000000000001',
    '2024-01-10',
    'Adobe Creative Cloud',
    1,
    1,
    5999,
    1000,
    'USD',
    'Monthly subscription for design tools',
    false,
    'unbilled'
),
(
    '00000000-0000-0000-0000-000000000001',
    '2024-01-15',
    'British Airways',
    2,
    3,
    45000,
    7500,
    'USD',
    'Flight to client site for consultation',
    true,
    'unbilled'
),
(
    '00000000-0000-0000-0000-000000000001',
    '2024-01-20',
    'Office Depot',
    3,
    NULL,
    15000,
    2500,
    'USD',
    'Office supplies and equipment',
    false,
    'unbilled'
),

-- User 2 expenses
(
    '00000000-0000-0000-0000-000000000002',
    '2024-01-12',
    'Google Ads',
    5,
    NULL,
    100000,
    8500,
    'USD',
    'Marketing campaign for Q1',
    false,
    'unbilled'
),
(
    '00000000-0000-0000-0000-000000000002',
    '2024-01-18',
    'Dell Technologies',
    6,
    5,
    250000,
    21250,
    'USD',
    'Development workstation for project',
    true,
    'unbilled'
),
(
    '00000000-0000-0000-0000-000000000002',
    '2024-02-01',
    'AWS',
    7,
    5,
    35000,
    2975,
    'USD',
    'Cloud hosting services - January',
    true,
    'unbilled'
),

-- User 3 expenses
(
    '00000000-0000-0000-0000-000000000003',
    '2024-01-15',
    'Udemy',
    8,
    NULL,
    19999,
    2000,
    'USD',
    'Advanced design course',
    false,
    'unbilled'
),
(
    '00000000-0000-0000-0000-000000000003',
    '2024-01-22',
    'Hiscox Insurance',
    9,
    NULL,
    150000,
    15000,
    'USD',
    'Professional indemnity insurance - Annual premium',
    false,
    'unbilled'
),
(
    '00000000-0000-0000-0000-000000000003',
    '2024-02-01',
    'Telstra',
    10,
    NULL,
    8000,
    800,
    'USD',
    'Internet and phone - January',
    false,
    'unbilled'
);

-- =====================================================
-- NOTES
-- =====================================================
INSERT INTO notes (user_id, entity, entity_id, body) VALUES
-- Client notes
(
    '00000000-0000-0000-0000-000000000001',
    'client',
    1,
    'Preferred contact: Email during business hours. Decision maker: Sarah Johnson (CTO)'
),
(
    '00000000-0000-0000-0000-000000000001',
    'client',
    2,
    'Large enterprise client. Requires detailed documentation and compliance checks for all deliverables.'
),
(
    '00000000-0000-0000-0000-000000000002',
    'client',
    4,
    'Very responsive client. Prefers weekly status updates via video call.'
),

-- Project notes
(
    '00000000-0000-0000-0000-000000000001',
    'project',
    1,
    'Client wants to launch before Q2. Tight deadline but manageable with current resources.'
),
(
    '00000000-0000-0000-0000-000000000001',
    'project',
    3,
    'Complex migration requiring careful planning. Weekly sync meetings scheduled with client IT team.'
),
(
    '00000000-0000-0000-0000-000000000002',
    'project',
    5,
    'Integration with legacy systems proving challenging. May need additional time for testing.'
),
(
    '00000000-0000-0000-0000-000000000003',
    'project',
    7,
    'Client very happy with initial concepts. Approved to proceed with development phase.'
);

-- =====================================================
-- EMAIL LOGS
-- =====================================================
INSERT INTO email_logs (
    user_id, document_id, to_email, subject, body, status, 
    provider_message_id, sent_at
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    1,
    'accounts@acmecorp.com',
    'Quote Q-0015 - Website Redesign 2024',
    'Dear Acme Corporation,\n\nPlease find attached our quote for the Website Redesign 2024 project.\n\nThis quote is valid for 30 days from the date of issue.\n\nBest regards,\nTechConsult Pro',
    'sent',
    'msg_abc123xyz',
    '2024-01-15 10:30:00+00'
),
(
    '00000000-0000-0000-0000-000000000001',
    2,
    'accounts@acmecorp.com',
    'Invoice INV-0042 - Website Redesign Milestone 1',
    'Dear Acme Corporation,\n\nPlease find attached invoice INV-0042 for the first milestone of the Website Redesign project.\n\nPayment is due within 30 days.\n\nBest regards,\nTechConsult Pro',
    'sent',
    'msg_def456uvw',
    '2024-02-01 09:00:00+00'
),
(
    '00000000-0000-0000-0000-000000000002',
    5,
    'payments@retailinnovations.com',
    'Invoice INV-00023 - E-commerce Platform Development',
    'Dear Retail Innovations,\n\nPlease find attached invoice INV-00023 for the initial deposit on the E-commerce Platform Development project.\n\nPayment is due within 15 days.\n\nBest regards,\nDigital Solutions Inc',
    'sent',
    'msg_ghi789rst',
    '2024-02-05 10:00:00+00'
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE tax_rates IS 'Seed data includes standard tax rates for different regions';
COMMENT ON TABLE categories IS 'Seed data includes common expense categories for consulting businesses';
COMMENT ON TABLE user_profiles IS 'Seed data includes 3 example user profiles from different regions';
COMMENT ON TABLE clients IS 'Seed data includes diverse client examples with different billing terms';
COMMENT ON TABLE projects IS 'Seed data includes projects in various stages (Active, Completed)';
COMMENT ON TABLE documents IS 'Seed data includes quotes and invoices in different statuses';
COMMENT ON TABLE payments IS 'Seed data includes partial and full payments with different methods';
COMMENT ON TABLE expenses IS 'Seed data includes billable and non-billable expenses';
COMMENT ON TABLE notes IS 'Seed data includes internal notes on clients and projects';
COMMENT ON TABLE email_logs IS 'Seed data includes sent email records for documents';