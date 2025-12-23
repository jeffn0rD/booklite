# Database Implementation Specification

## Overview

This document describes the PostgreSQL/Supabase database implementation for the Booklite lightweight bookkeeping application. The schema supports multi-tenant data isolation, automated business logic, and comprehensive financial tracking.

## Version Information

- **Version**: 1.0
- **Database**: PostgreSQL 12+ / Supabase
- **Implementation Date**: 2024-12-23
- **Status**: Production Ready

## Architecture

### Multi-Tenancy Model
- **Isolation Method**: Row Level Security (RLS)
- **Tenant Identifier**: `user_id` (UUID from Supabase Auth)
- **Scope**: All tables include `user_id` for data isolation
- **Authentication**: Supabase Auth with `auth.users` table

### Data Storage Strategy
- **Monetary Values**: Integer cents (USD) to avoid floating-point issues
- **Timestamps**: UTC with `timestamptz` type
- **Soft Deletes**: `archived_at` timestamp for reversible deletion
- **Structured Data**: JSONB for flexible address storage

## Schema Components

### Core Tables (14 Total)

#### 1. user_profiles
**Purpose**: Business information and defaults for each user (1:1 with auth.users)

**Key Fields**:
- `user_id` (PK/FK to auth.users)
- Business name, legal name, address
- Tax ID and logo attachment
- Default tax rate and payment terms
- Document numbering configuration

**Business Rules**:
- One profile per user
- Optional logo attachment
- Configurable numbering prefixes and padding

#### 2. clients
**Purpose**: Customer directory with billing defaults

**Key Fields**:
- `id` (PK), `user_id` (FK)
- Name, email, billing address (JSONB)
- Tax/VAT ID
- Default tax rate and payment terms

**Business Rules**:
- Unique name per user
- Email format validation
- Soft delete support

#### 3. projects
**Purpose**: Project management under clients

**Key Fields**:
- `id` (PK), `user_id` (FK), `client_id` (FK)
- Name, status (Active/Completed/Archived)
- Default PO number
- Origin quote reference

**Business Rules**:
- Must belong to a client
- Status enum validation
- Optional quote-to-project linkage

#### 4. documents
**Purpose**: Quotes and invoices with lifecycle management

**Key Fields**:
- `id` (PK), `user_id` (FK), `client_id` (FK), `project_id` (FK)
- Type (quote/invoice)
- Number (unique per user/type)
- Dates (issue, due, expiry)
- Monetary totals (subtotal, tax, total, paid, balance)
- Status (varies by type)

**Business Rules**:
- Invoice statuses: Draft, Sent, Unpaid, Partial, Paid, Void
- Quote statuses: Draft, Sent, Accepted, Expired
- Cannot archive unpaid invoices
- Totals calculated from line items
- Status derived from payments

#### 5. document_line_items
**Purpose**: Line items for quotes and invoices

**Key Fields**:
- `id` (PK), `user_id` (FK), `document_id` (FK)
- Position, description
- Quantity, unit, unit price
- Tax rate (snapshot), calculated totals

**Business Rules**:
- Position >= 1 for ordering
- Automatic total calculations
- Tax rate stored as value (not FK)

#### 6. payments
**Purpose**: Payment tracking against invoices

**Key Fields**:
- `id` (PK), `user_id` (FK), `invoice_id` (FK)
- Date, amount, method, reference

**Business Rules**:
- Only for invoice-type documents
- Positive amounts only
- Updates invoice status automatically

#### 7. expenses
**Purpose**: Business expense tracking with billable support

**Key Fields**:
- `id` (PK), `user_id` (FK)
- Date, vendor, category, project
- Total and tax amounts
- Billable flag, billing status
- Linked invoice reference

**Business Rules**:
- Billing status: unbilled, billed, user_paid
- Can link to invoice when billed
- Receipt attachment support

#### 8. categories
**Purpose**: User-defined expense categories

**Key Fields**:
- `id` (PK), `user_id` (FK)
- Name, description

**Business Rules**:
- Unique name per user
- Simple categorization system

#### 9. attachments
**Purpose**: File metadata for receipts, PDFs, logos

**Key Fields**:
- `id` (PK), `user_id` (FK)
- Bucket, path, mime type
- Size, SHA256 hash

**Business Rules**:
- Unique path per user/bucket
- Stored in Cloudflare Storage
- Metadata only (not binary data)

#### 10. email_logs
**Purpose**: Document email history

**Key Fields**:
- `id` (PK), `user_id` (FK), `document_id` (FK)
- To email, subject, body
- Status, provider message ID, sent timestamp

**Business Rules**:
- Status: queued, sent, failed
- Preserves email body snapshot
- Tracks provider delivery

#### 11. number_sequences
**Purpose**: Gap-tolerant document numbering

**Key Fields**:
- `id` (PK), `user_id` (FK)
- Type (quote/invoice)
- Prefix, current value, padding

**Business Rules**:
- One sequence per type per user
- Atomic increment with SELECT FOR UPDATE
- Configurable prefix and padding

#### 12. notes
**Purpose**: Internal notes on clients and projects

**Key Fields**:
- `id` (PK), `user_id` (FK)
- Entity type (client/project)
- Entity ID, body

**Business Rules**:
- Polymorphic relationship
- Entity type validation

#### 13. tax_rates
**Purpose**: Configurable tax rates per user

**Key Fields**:
- `id` (PK), `user_id` (FK)
- Name, rate percentage
- Is default flag

**Business Rules**:
- Unique name per user
- Only one default per user
- Rate 0-100%

#### 14. official_copies
**Purpose**: Immutable document snapshots

**Key Fields**:
- `id` (PK), `user_id` (FK), `document_id` (FK)
- PDF attachment ID
- Email body snapshot

**Business Rules**:
- Created on Send/Finalize
- One copy per document (latest)
- Preserves legal record

## Constraints and Validations

### Foreign Key Constraints
- All tables reference `auth.users(id)` via `user_id`
- Cross-table FKs validated for same user
- Deferrable constraints for complex insertions
- Cascade deletes where appropriate

### Unique Constraints
- Clients: unique name per user
- Documents: unique number per user/type
- Categories: unique name per user
- Tax rates: unique name per user, single default
- Number sequences: unique type per user
- Attachments: unique path per user/bucket

### Check Constraints
- Email format validation
- Positive monetary amounts
- Status enum validation
- Date range validations
- Length constraints on text fields

### Same-User Validation
Triggers ensure cross-table foreign keys share the same `user_id`:
- Projects must reference same-user clients
- Documents must reference same-user clients/projects
- Line items must reference same-user documents
- Payments must reference same-user invoices

## Indexes

### Primary Indexes
- All primary keys (implicit B-tree)
- All foreign keys (explicit)

### Composite Indexes
- `(user_id, client_id, type, status)` on documents
- `(user_id, project_id, date)` on expenses
- `(user_id, billing_status, project_id)` on expenses

### Partial Indexes
- Accounts Receivable: unpaid/partial invoices
- Sent documents: `WHERE sent_at IS NOT NULL`
- Active records: `WHERE archived_at IS NULL`
- Default tax rates: `WHERE is_default = true`

### Performance Targets
- Dashboard queries: < 100ms
- Document retrieval: < 50ms
- Report generation: < 500ms

## Triggers and Automation

### Timestamp Management
- `updated_at` automatically updated on row modification
- Applied to all tables with `updated_at` column

### Line Item Calculations
- Automatic calculation of subtotal, tax, and total
- Triggered on INSERT/UPDATE
- Preserves historical values

### Document Total Recalculation
- Triggered by line item changes
- Recalculates subtotal, tax total, and total
- Updates balance due

### Payment Status Tracking
- Triggered by payment INSERT/UPDATE/DELETE
- Calculates total paid amount
- Derives invoice status (Unpaid/Partial/Paid)
- Preserves Void and Draft statuses

### Document Number Assignment
- Triggered on document finalization
- Atomic sequence increment
- Format: `{prefix}{padded_number}`
- Gap-tolerant numbering

### PO Number Inheritance
- Triggered on document creation
- Inherits from project if null
- One-time copy on insert

### Quote Expiry
- Triggered on document update
- Marks expired when expiry_date passes
- Only if not already accepted

### Status Transition Validation
- Prevents invalid status changes
- Sets timestamps on status changes
- Enforces business rules

## Row Level Security (RLS)

### Policy Structure
All tables have four policies:
1. **SELECT**: `user_id = auth.uid()`
2. **INSERT**: `user_id = auth.uid()`
3. **UPDATE**: `user_id = auth.uid()` (both USING and WITH CHECK)
4. **DELETE**: `user_id = auth.uid()`

### Security Guarantees
- Complete data isolation between users
- No cross-user data access
- Enforced at database level
- Transparent to application code

### Storage Policies
Cloudflare Storage buckets organized by user:
- Path format: `{user_id}/{filename}`
- Bucket-level access control
- Metadata in attachments table

## Migration Strategy

### Phase 1: Core Schema
1. Create base tables
2. Add primary keys
3. Basic constraints

### Phase 2: Constraints
1. Foreign key relationships
2. Unique constraints
3. Check constraints
4. Same-user validation triggers

### Phase 3: Indexes
1. Foreign key indexes
2. Composite indexes
3. Partial indexes
4. Performance optimization

### Phase 4: Triggers
1. Timestamp automation
2. Calculation triggers
3. Status management
4. Business logic

### Phase 5: RLS
1. Enable RLS on all tables
2. Create policies
3. Test isolation
4. Verify security

### Phase 6: Seed Data (Optional)
1. Test users
2. Sample clients and projects
3. Example documents
4. Reference data

## Rollback Procedures

### Pre-Migration
- Full database backup
- Transaction wrapping
- Dry-run testing
- Rollback script ready

### Rollback Process
1. Drop RLS policies
2. Drop triggers
3. Drop functions
4. Drop tables (reverse order)
5. Verify cleanup

### Recovery
- Point-in-time restore
- Selective table recovery
- Data integrity verification
- Minimal downtime

## Performance Considerations

### Query Optimization
- Indexed foreign keys
- Composite indexes for common queries
- Partial indexes for filtered data
- Covering indexes where beneficial

### Materialized Fields
- Document totals (subtotal, tax, total)
- Payment amounts (amount_paid, balance_due)
- Line item calculations
- Trade-off: storage vs. computation

### Trigger Performance
- Minimal logic in triggers
- Efficient queries
- Proper indexing
- Avoid cascading triggers

### Scalability
- Designed for < 50 clients per user
- Efficient for small business scale
- Vertical scaling sufficient
- Horizontal scaling via user_id sharding

## Data Integrity

### Referential Integrity
- Foreign key constraints
- Cascade deletes where appropriate
- Deferrable constraints for complex operations

### Business Logic Integrity
- Status transition validation
- Monetary calculation accuracy
- Date consistency checks
- Soft delete enforcement

### Audit Trail
- Timestamps on all records
- Email logs for communications
- Official copies for legal records
- Payment history preservation

## Testing Strategy

### Unit Tests
- Constraint validation
- Trigger functionality
- RLS policy enforcement
- Calculation accuracy

### Integration Tests
- Multi-table operations
- Transaction handling
- Concurrent access
- Error scenarios

### Performance Tests
- Query response times
- Bulk operations
- Concurrent users
- Index effectiveness

## Maintenance

### Regular Tasks
- Vacuum and analyze
- Index maintenance
- Statistics updates
- Backup verification

### Monitoring
- Query performance
- Table sizes
- Index usage
- RLS policy hits

### Optimization
- Query plan analysis
- Index tuning
- Trigger optimization
- Constraint review

## Future Enhancements

### Planned Features
- Multi-currency support (fields exist, constrained to USD)
- Multiple official copies per document
- Advanced reporting views
- Materialized views for dashboards

### Schema Evolution
- Version-controlled migrations
- Backward compatibility
- Data migration scripts
- Rollback procedures

## References

- **ERD Specification**: `/specs/entities.md`
- **Architecture Document**: `/specs/lightweight-bookkeeping-system-architecture.md`
- **Security Policy**: `/specs/security-and-authentication-policy.md`
- **SQL Files**: `/sql/`
- **RAG Documentation**: `/docs/rag/`

## Support

For implementation questions or issues:
1. Review SQL files in `/sql/` directory
2. Check README.md in `/sql/` for detailed instructions
3. Consult specification documents
4. Contact development team

---

**Document Version**: 1.0  
**Last Updated**: 2024-12-23  
**Status**: Production Ready