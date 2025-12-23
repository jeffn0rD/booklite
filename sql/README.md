# Booklite Database Schema

This directory contains the complete PostgreSQL/Supabase database schema for the Booklite lightweight bookkeeping application.

## Overview

The database schema implements a multi-tenant bookkeeping system with:
- **14 core tables** for managing clients, projects, documents (quotes/invoices), payments, and expenses
- **Row Level Security (RLS)** for data isolation between users
- **Automated triggers** for business logic and derived fields
- **Performance indexes** optimized for common query patterns
- **Comprehensive constraints** for data integrity

## File Structure

### Core Schema Files

1. **01_schema_core.sql** - Base table definitions with primary keys
   - All 14 core tables with field definitions
   - Basic constraints and data types
   - Table comments and documentation

2. **02_constraints.sql** - Foreign keys and validation constraints
   - Foreign key relationships between tables
   - Unique constraints for data integrity
   - Check constraints for business rules
   - Same-user validation triggers

3. **03_indexes.sql** - Performance indexes
   - Primary and foreign key indexes
   - Composite indexes for common queries
   - Partial indexes for filtered queries
   - Indexes for reporting and dashboard queries

4. **04_triggers.sql** - Business logic and automation
   - Automatic timestamp updates
   - Line item total calculations
   - Document total recalculation
   - Payment status tracking
   - Document number assignment
   - PO number inheritance
   - Status transition validation

5. **05_rls_policies.sql** - Row Level Security policies
   - Enable RLS on all tables
   - User-scoped SELECT/INSERT/UPDATE/DELETE policies
   - Multi-tenant data isolation
   - Storage bucket policies (commented examples)

6. **06_seed_data.sql** - Test data for development
   - 3 example users with complete profiles
   - 7 clients across different industries
   - 8 projects in various stages
   - 7 documents (quotes and invoices)
   - Multiple line items, payments, and expenses
   - Categories, tax rates, and notes

### Migration Scripts

- **migration_up.sql** - Complete migration script
  - Executes all schema files in correct order
  - Transaction-wrapped for safety
  - Progress indicators
  - Optional seed data loading

- **migration_down.sql** - Rollback script
  - Removes all database objects
  - Drops policies, triggers, functions, and tables
  - 5-second safety delay
  - Transaction-wrapped

## Database Schema

### Entity Relationship Overview

```
auth.users (Supabase Auth)
    ↓
user_profiles (1:1)
    ↓
├── clients (1:N)
│   ├── projects (1:N)
│   │   ├── documents (1:N)
│   │   │   ├── document_line_items (1:N)
│   │   │   ├── payments (1:N, invoices only)
│   │   │   ├── email_logs (1:N)
│   │   │   └── official_copies (1:1)
│   │   └── expenses (1:N)
│   └── notes (1:N)
├── categories (1:N)
├── tax_rates (1:N)
├── number_sequences (1:N)
└── attachments (1:N)
```

### Key Tables

#### Core Business Entities
- **user_profiles** - Business information and defaults
- **clients** - Customer directory
- **projects** - Project management under clients
- **documents** - Quotes and invoices
- **document_line_items** - Line items for documents

#### Financial Tracking
- **payments** - Payment records against invoices
- **expenses** - Business expenses with billable tracking
- **categories** - Expense categorization

#### Supporting Tables
- **attachments** - File metadata (receipts, PDFs, logos)
- **email_logs** - Document email history
- **number_sequences** - Document numbering
- **notes** - Internal notes on clients/projects
- **tax_rates** - Configurable tax rates
- **official_copies** - Immutable document snapshots

## Installation

### Prerequisites
- PostgreSQL 12+ or Supabase project
- Supabase Auth configured with auth.users table
- psql client or Supabase SQL editor

### Option 1: Complete Migration (Recommended)

```bash
# Navigate to sql directory
cd booklite/sql

# Run complete migration
psql -U your_user -d your_database -f migration_up.sql

# Or for Supabase, use the SQL editor and paste the contents
```

### Option 2: Step-by-Step Installation

```bash
# Execute files in order
psql -U your_user -d your_database -f 01_schema_core.sql
psql -U your_user -d your_database -f 02_constraints.sql
psql -U your_user -d your_database -f 03_indexes.sql
psql -U your_user -d your_database -f 04_triggers.sql
psql -U your_user -d your_database -f 05_rls_policies.sql

# Optional: Load seed data
psql -U your_user -d your_database -f 06_seed_data.sql
```

### Option 3: Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste contents of each file in order
5. Execute each file sequentially

## Configuration

### Seed Data User IDs

Before loading seed data, update the user IDs in `06_seed_data.sql`:

```sql
-- Replace these placeholder UUIDs with actual user IDs from auth.users
'00000000-0000-0000-0000-000000000001'
'00000000-0000-0000-0000-000000000002'
'00000000-0000-0000-0000-000000000003'
```

### RLS Policies

All tables have RLS enabled with policies that restrict access to:
```sql
user_id = auth.uid()
```

This ensures complete data isolation between users.

## Key Features

### Monetary Values
- All amounts stored as **integers in cents** (USD)
- Avoids floating-point precision issues
- Currency field constrained to 'USD' (future-proofed)

### Document Numbering
- Gap-tolerant sequential numbering
- Configurable prefix and padding per user
- Atomic increment using `SELECT FOR UPDATE`
- Format: `{prefix}{padded_number}` (e.g., "INV-0042")

### Status Management
- **Invoice statuses**: Draft, Sent, Unpaid, Partial, Paid, Void
- **Quote statuses**: Draft, Sent, Accepted, Expired
- Automatic status derivation from payments
- Transition validation via triggers

### Soft Deletes
- `archived_at` timestamp for soft deletion
- Prevents archiving unpaid invoices
- Queries filter `WHERE archived_at IS NULL`

### Derived Fields
- Document totals calculated from line items
- Payment amounts tracked and status updated
- Balance due computed automatically
- Line item calculations (subtotal, tax, total)

### Business Logic Triggers
- PO number inheritance from projects
- Document number assignment on finalization
- Quote expiry checking
- Payment status synchronization
- Expense billing status validation

## Performance Considerations

### Indexes
- All foreign keys indexed
- Composite indexes for common queries
- Partial indexes for filtered queries (AR, sent documents)
- Covering indexes for dashboard queries

### Query Patterns
Optimized for:
- User dashboard (documents by status)
- Accounts Receivable (unpaid invoices)
- Project profitability (expenses by project)
- Client history (documents by client)
- Expense reporting (by category, date)

## Rollback

To completely remove the schema:

```bash
psql -U your_user -d your_database -f migration_down.sql
```

**WARNING**: This will delete all data and schema objects!

## Maintenance

### Backup Before Migration
```bash
pg_dump -U your_user -d your_database > backup_$(date +%Y%m%d).sql
```

### Verify Installation
```sql
-- Check tables
\dt

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check indexes
\di

-- Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verify row counts (if seed data loaded)
SELECT 
    'clients' as table_name, COUNT(*) as rows FROM clients
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'documents', COUNT(*) FROM documents;
```

## Troubleshooting

### Common Issues

1. **Foreign key constraint violations**
   - Ensure auth.users table exists
   - Check user_id values in seed data
   - Verify referential integrity

2. **RLS policy errors**
   - Confirm auth.uid() returns valid UUID
   - Check user authentication
   - Verify policy conditions

3. **Trigger failures**
   - Check function definitions exist
   - Verify trigger timing (BEFORE/AFTER)
   - Review trigger conditions

4. **Unique constraint violations**
   - Check for duplicate names per user
   - Verify document numbers are unique
   - Review partial unique indexes

## Development

### Adding New Tables

1. Add table definition to `01_schema_core.sql`
2. Add foreign keys to `02_constraints.sql`
3. Add indexes to `03_indexes.sql`
4. Add triggers if needed to `04_triggers.sql`
5. Add RLS policies to `05_rls_policies.sql`
6. Update seed data in `06_seed_data.sql`
7. Update migration scripts

### Modifying Existing Tables

1. Create new migration file: `07_alter_[description].sql`
2. Add corresponding rollback: `07_rollback_[description].sql`
3. Test in development environment
4. Update documentation

## Testing

### Unit Tests
```sql
-- Test RLS policies
SET ROLE authenticated;
SET request.jwt.claim.sub = 'test-user-uuid';

-- Should return only user's data
SELECT * FROM clients;

-- Test triggers
INSERT INTO document_line_items (...);
-- Verify document totals updated

-- Test constraints
INSERT INTO clients (user_id, name, email) 
VALUES ('uuid', 'Test', 'invalid-email');
-- Should fail with email format error
```

## Support

For issues or questions:
1. Check the specification documents in `/specs`
2. Review the RAG database documentation in `/docs/rag`
3. Consult the architecture document
4. Contact the development team

## Version History

- **v1.0** (2024-12-23) - Initial schema release
  - 14 core tables
  - Complete RLS implementation
  - Business logic triggers
  - Seed data for testing

## License

Copyright © 2024 Booklite. All rights reserved.