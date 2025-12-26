# CRITICAL: Additional Schema Mismatches Found

## Problem
While fixing test fixtures, discovered that TypeScript types include fields that **DO NOT EXIST** in the database schema.

## Affected Entity: Clients

### Database Schema (ACTUAL)
```sql
CREATE TABLE clients (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    billing_address jsonb,
    tax_vat_id text,
    default_tax_rate_id bigint,
    default_payment_terms_days int,
    default_currency text DEFAULT 'USD',
    archived_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

### TypeScript Types (INCORRECT)
```typescript
export interface Client {
  id: number;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;          // ❌ DOES NOT EXIST IN DATABASE
  billing_address: Address | null;
  tax_vat_id: string | null;
  default_tax_rate_id: number | null;
  default_payment_terms_days: number | null;
  notes: string | null;           // ❌ DOES NOT EXIST IN DATABASE
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}
```

## Fields That Don't Exist
1. **`phone`** - Not in database schema
2. **`notes`** - Not in database schema

## Impact
- Integration tests failing with "Could not find the 'notes' column"
- Any code trying to save `phone` or `notes` will fail
- Database inserts/updates will fail

## Root Cause
TypeScript types were created without referencing the actual SQL schema files.

## Fix Required
1. Remove `phone` and `notes` from Client interface
2. Remove `phone` and `notes` from Zod schemas
3. Remove `phone` and `notes` from test fixtures
4. Update any service code using these fields

## Decision Point
Should we:
A. Remove these fields from TypeScript (match database)
B. Add these fields to database (match TypeScript)

**Recommendation**: Remove from TypeScript - database schema is the source of truth.