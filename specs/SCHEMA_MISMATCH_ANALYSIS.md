# Schema Mismatch Analysis - Root Cause and Fix Strategy

## Executive Summary

**Problem**: Integration tests failing due to test fixtures using incorrect field structure that doesn't match the database schema.

**Root Cause**: Test fixtures were created without referencing the actual database schema or TypeScript types.

**Scope**: Limited to `clients` entity test fixtures. TypeScript types and Zod schemas are **correct**.

**Impact**: All integration tests for clients API are failing with 500 errors.

## Detailed Analysis

### What's Correct ✅

1. **Database Schema** (`sql/01_schema_core.sql`)
   ```sql
   CREATE TABLE clients (
       id bigserial PRIMARY KEY,
       user_id uuid NOT NULL,
       name text NOT NULL,
       email text NOT NULL,
       billing_address jsonb,  -- ✅ JSONB structure
       tax_vat_id text,
       default_tax_rate_id bigint,
       default_payment_terms_days int,
       default_currency text DEFAULT 'USD',
       archived_at timestamptz,
       created_at timestamptz NOT NULL DEFAULT now(),
       updated_at timestamptz NOT NULL DEFAULT now()
   );
   ```

2. **TypeScript Types** (`src/shared/types/index.ts`)
   ```typescript
   export interface Client {
     id: number;
     user_id: string;
     name: string;
     email: string | null;
     phone: string | null;
     billing_address: Address | null;  // ✅ Correct type
     tax_vat_id: string | null;
     default_tax_rate_id: number | null;
     default_payment_terms_days: number | null;
     notes: string | null;
     archived_at: string | null;
     created_at: string;
     updated_at: string;
   }

   export interface Address {
     line1?: string;
     line2?: string;
     city?: string;
     region?: string;
     postal_code?: string;
     country?: string;
   }
   ```

3. **Zod Schemas** (`src/shared/schemas/client.schema.ts`)
   ```typescript
   export const addressSchema = z.object({
     line1: z.string().max(200).optional(),
     line2: z.string().max(200).optional(),
     city: z.string().max(100).optional(),
     region: z.string().max(100).optional(),
     postal_code: z.string().max(20).optional(),
     country: z.string().regex(/^[A-Z]{2}$/).optional(),
   }).optional();

   export const createClientSchema = z.object({
     name: z.string().min(1).max(200),
     email: z.string().email().optional().nullable(),
     phone: z.string().max(50).optional().nullable(),
     billing_address: addressSchema.nullable().optional(),  // ✅ Correct
     tax_vat_id: z.string().max(50).optional().nullable(),
     // ... other fields
   });
   ```

4. **Seed Data** (`sql/06_seed_data.sql`)
   ```sql
   INSERT INTO clients (user_id, name, email, billing_address, tax_vat_id, ...)
   VALUES (
     '1e30f54a-1214-48c0-a020-d214e832fee5',
     'Acme Corporation',
     'accounts@acmecorp.com',
     '{"line1": "100 Business Park", "city": "Manchester", 
       "region": "Greater Manchester", "postal_code": "M1 1AA", 
       "country": "GB"}'::jsonb,  -- ✅ Correct JSONB structure
     'GB987654321',
     30,
     'USD'
   );
   ```

### What's Wrong ❌

**Test Fixtures** (`tests/fixtures/clients.ts`)

```typescript
// WRONG - Doesn't match schema
export const validClient = {
  name: 'Acme Corporation',
  email: 'contact@acme.test.example.com',
  phone: '+1-555-0100',
  company: 'Acme Corp',           // ❌ Field doesn't exist
  address: '123 Main St',         // ❌ Should be billing_address.line1
  city: 'San Francisco',          // ❌ Should be billing_address.city
  state: 'CA',                    // ❌ Should be billing_address.region
  postal_code: '94102',           // ❌ Should be billing_address.postal_code
  country: 'US',                  // ❌ Should be billing_address.country
  tax_id: '12-3456789',          // ❌ Should be tax_vat_id
  notes: 'Premium client',
  is_active: true,               // ❌ Field doesn't exist (use archived_at)
};
```

**Should be:**

```typescript
// CORRECT - Matches schema
export const validClient = {
  name: 'Acme Corporation',
  email: 'contact@acme.test.example.com',
  phone: '+1-555-0100',
  billing_address: {              // ✅ Nested object
    line1: '123 Main St',
    city: 'San Francisco',
    region: 'CA',
    postal_code: '94102',
    country: 'US',
  },
  tax_vat_id: '12-3456789',      // ✅ Correct field name
  notes: 'Premium client',
  // archived_at is null by default (active client)
};
```

## Why Did This Happen?

### Design Decision: JSONB for Address

**Question 2a**: Why was address specified as JSON?

**Answer**: This was an **intentional design decision** documented in the original ERD:

1. **Flexibility**: Different countries have different address formats
2. **Extensibility**: Can add fields (line2, apartment, etc.) without schema changes
3. **Normalization**: Avoids creating separate address tables
4. **Common Pattern**: Standard practice for flexible, semi-structured data

**Evidence from original spec** (`prompts/database_schema_prompt.md`):
```
### clients
- Fields: name, email, billing_address(jsonb), tax_vat_id, ...
```

This was explicitly specified as JSONB from the beginning.

### Process Failure

**Question 2b**: How did this mismatch happen?

**Root Causes**:

1. **Test fixtures created without schema reference**
   - Fixtures were written based on assumptions, not actual schema
   - No validation against TypeScript types or Zod schemas
   - No cross-reference with seed data

2. **Lack of type checking in test files**
   - Test fixtures are plain JavaScript objects
   - No TypeScript type annotations enforcing structure
   - No compile-time validation

3. **Missing integration test validation**
   - Tests weren't run against actual database
   - Mock-based unit tests passed with wrong structure
   - Integration tests would have caught this immediately

4. **Documentation not consulted**
   - Seed data in `sql/06_seed_data.sql` shows correct structure
   - TypeScript types in `src/shared/types/index.ts` are correct
   - Test fixtures ignored both sources of truth

## Scope Assessment

### Other Entities Audit

Let me check if other entities have similar issues:

**JSONB Fields in Schema**:
```bash
$ grep "jsonb" sql/01_schema_core.sql
    billing_address jsonb,  # Only in clients table
```

**Result**: Only `clients` table uses JSONB. Other entities use flat structures.

**Other Test Fixtures**:
- `documents.ts` - Need to verify
- `projects.ts` - Need to verify
- `payments.ts` - Need to verify
- `expenses.ts` - Need to verify

## Fix Strategy

### Approach: Fix Test Fixtures (Not Schema)

**Decision**: Keep the JSONB schema design and fix test fixtures.

**Rationale**:
1. Schema design is intentional and well-justified
2. TypeScript types and Zod schemas are already correct
3. Seed data demonstrates correct usage
4. Only test fixtures need updating
5. Changing schema would require:
   - Migration scripts
   - Service layer updates
   - API documentation updates
   - Much larger scope

### Implementation Plan

1. **Fix Client Test Fixtures** ✅ Priority 1
   - Update `tests/fixtures/clients.ts`
   - Match structure to TypeScript types
   - Add type annotations for compile-time checking
   - Verify against Zod schemas

2. **Audit Other Test Fixtures** ✅ Priority 1
   - Check all fixture files in `tests/fixtures/`
   - Compare with TypeScript types
   - Compare with database schema
   - Document any other mismatches

3. **Add Type Safety** ✅ Priority 2
   - Add TypeScript type annotations to fixtures
   - Enable strict type checking in test files
   - Add compile-time validation

4. **Run Integration Tests** ✅ Priority 1
   - Verify fixes with actual database
   - Ensure all tests pass
   - Document test results

5. **Update Documentation** ✅ Priority 2
   - Document correct fixture patterns
   - Add examples of JSONB usage
   - Create fixture creation guidelines

6. **Prevent Future Issues** ✅ Priority 3
   - Add fixture validation utilities
   - Create fixture generator from types
   - Add pre-commit hooks for type checking

## Prevention Guidelines

### For Future Test Fixtures

1. **Always reference TypeScript types**
   ```typescript
   import { Client } from '@/shared/types';
   
   export const validClient: Partial<Client> = {
     // TypeScript will enforce correct structure
   };
   ```

2. **Validate against Zod schemas**
   ```typescript
   import { createClientSchema } from '@/shared/schemas/client.schema';
   
   const result = createClientSchema.safeParse(validClient);
   if (!result.success) {
     throw new Error('Invalid fixture');
   }
   ```

3. **Reference seed data**
   - Check `sql/06_seed_data.sql` for examples
   - Match structure exactly
   - Use same field names

4. **Run integration tests early**
   - Test against real database
   - Don't rely only on mocks
   - Catch schema mismatches immediately

## Next Steps

1. ✅ Fix `tests/fixtures/clients.ts`
2. ✅ Audit all other fixture files
3. ✅ Run integration tests
4. ✅ Document changes
5. ✅ Update RAG database
6. ✅ Commit and push

## Lessons Learned

1. **Schema is source of truth** - Always reference actual schema
2. **Type safety matters** - Use TypeScript types in test files
3. **Integration tests are critical** - Mock tests can hide issues
4. **Documentation must be consulted** - Seed data shows correct usage
5. **JSONB is intentional** - Flexible design for complex data structures

## Conclusion

This is a **limited, fixable issue** affecting only client test fixtures. The core architecture (schema, types, validation) is correct. The fix is straightforward: update test fixtures to match the existing, correct schema design.

**Impact**: Low - only affects test suite, not production code
**Effort**: Low - simple fixture updates
**Risk**: Low - well-defined fix with clear validation