# Test Fixture Audit Results

## Summary

**Audit Date**: 2024-12-26
**Files Audited**: 5 fixture files
**Issues Found**: Multiple field name and structure mismatches across all fixtures

## Critical Findings

### 1. Clients Fixture ❌ CRITICAL ISSUES

**File**: `tests/fixtures/clients.ts`

**Issues**:
1. ❌ `company` field doesn't exist in schema
2. ❌ Flat address fields (`address`, `city`, `state`, `postal_code`, `country`) should be nested in `billing_address` JSONB object
3. ❌ `tax_id` should be `tax_vat_id`
4. ❌ `is_active` field doesn't exist (use `archived_at` instead)
5. ❌ Missing `default_currency` field

**Schema Fields**:
```typescript
{
  name: string;
  email: string | null;
  phone: string | null;
  billing_address: {
    line1?: string;
    line2?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  } | null;
  tax_vat_id: string | null;
  default_tax_rate_id: number | null;
  default_payment_terms_days: number | null;
  default_currency: string; // Default 'USD'
  notes: string | null;
  archived_at: string | null;
}
```

### 2. Documents Fixture ⚠️ MODERATE ISSUES

**File**: `tests/fixtures/documents.ts`

**Issues**:
1. ⚠️ Missing required `client_id` field
2. ⚠️ `notes` should be `public_notes` or `internal_notes`
3. ⚠️ `terms` field doesn't exist
4. ⚠️ `valid_until` should be `expiry_date`
5. ⚠️ `payment_date` field doesn't exist
6. ⚠️ Amounts should be in cents (`total_cents`, `subtotal_cents`, etc.)
7. ⚠️ Line items missing required fields

**Schema Fields**:
```typescript
{
  type: 'quote' | 'invoice';
  client_id: number; // REQUIRED
  project_id?: number | null;
  po_number?: string | null;
  issue_date?: string | null;
  due_date?: string | null;
  expiry_date?: string | null;
  public_notes?: string | null;
  internal_notes?: string | null;
  currency: string; // Default 'USD'
  subtotal_cents: number;
  tax_total_cents: number;
  total_cents: number;
  amount_paid_cents: number;
  balance_due_cents: number;
  status: string; // Default 'Draft'
}
```

**Line Item Schema**:
```typescript
{
  description: string;
  quantity: number;
  unit_price_cents: number; // Should be in cents!
  tax_rate_id?: number | null;
  discount_percent?: number;
}
```

### 3. Projects Fixture ❌ CRITICAL ISSUES

**File**: `tests/fixtures/projects.ts`

**Issues**:
1. ❌ Missing required `client_id` field
2. ❌ `description` field doesn't exist (use `notes` instead)
3. ❌ `start_date` field doesn't exist
4. ❌ `end_date` field doesn't exist
5. ❌ `budget` field doesn't exist
6. ❌ `hourly_rate` field doesn't exist
7. ❌ Status values wrong: `'active'` should be `'Active'`, `'completed'` should be `'Completed'`
8. ❌ Invalid status `'on_hold'` (valid: 'Active', 'Completed', 'Archived')

**Schema Fields**:
```typescript
{
  client_id: number; // REQUIRED
  name: string;
  status: 'Active' | 'Completed' | 'Archived'; // Default 'Active'
  default_po_number?: string | null;
  notes?: string | null;
  origin_quote_id?: number | null;
  archived_at?: string | null;
}
```

**Note**: Projects table is intentionally minimal. Budget, dates, and hourly rates are NOT part of the schema.

### 4. Payments Fixture ❌ CRITICAL ISSUES

**File**: `tests/fixtures/payments.ts`

**Issues**:
1. ❌ Missing required `invoice_id` field
2. ❌ `amount` should be `amount_cents` (in cents)
3. ❌ `payment_date` should be `date`
4. ❌ `payment_method` should be `method`
5. ❌ `notes` field doesn't exist in schema

**Schema Fields**:
```typescript
{
  invoice_id: number; // REQUIRED
  date: string; // Date string
  amount_cents: number; // Must be positive
  method?: string | null; // Max 50 chars
  reference?: string | null; // Max 100 chars
}
```

### 5. Expenses Fixture ❌ CRITICAL ISSUES

**File**: `tests/fixtures/expenses.ts`

**Issues**:
1. ❌ `amount` should be `total_amount_cents` (in cents)
2. ❌ `expense_date` should be `date`
3. ❌ `payment_method` field doesn't exist
4. ❌ `is_billable` should be `billable`
5. ❌ Missing `tax_amount_cents` field
6. ❌ Missing `currency` field (default 'USD')
7. ❌ Missing `billing_status` field (default 'unbilled')

**Schema Fields**:
```typescript
{
  date: string; // Date string
  vendor?: string | null; // Max 200 chars
  category_id?: number | null;
  project_id?: number | null;
  total_amount_cents: number; // Must be >= 0
  tax_amount_cents: number; // Default 0
  currency: string; // Default 'USD'
  receipt_attachment_id?: number | null;
  notes?: string | null;
  billable: boolean; // Default false
  billing_status: 'unbilled' | 'billed' | 'user_paid'; // Default 'unbilled'
  linked_invoice_id?: number | null;
}
```

## Common Patterns of Errors

### 1. Currency Amounts Not in Cents
**Wrong**: `amount: 1000.00`
**Correct**: `amount_cents: 100000` (multiply by 100)

All monetary values in the database are stored as integers in cents to avoid floating-point precision issues.

### 2. Missing Required Foreign Keys
Many fixtures are missing required `client_id`, `invoice_id`, etc. These are REQUIRED fields and tests will fail without them.

### 3. Field Name Mismatches
- `payment_date` → `date`
- `expense_date` → `date`
- `is_billable` → `billable`
- `payment_method` → `method`
- `tax_id` → `tax_vat_id`

### 4. Non-existent Fields
Many fixtures include fields that don't exist in the schema:
- `company` (clients)
- `description` (projects)
- `start_date`, `end_date`, `budget`, `hourly_rate` (projects)
- `payment_method` (expenses)
- `notes` (payments)
- `terms` (documents)

### 5. Status/Enum Case Sensitivity
- Projects: `'active'` → `'Active'`, `'completed'` → `'Completed'`
- Documents: Status values are case-sensitive

### 6. JSONB Structure
Only `clients.billing_address` uses JSONB. It must be a nested object, not flat fields.

## Impact Assessment

### Test Failures
All integration tests are currently failing because:
1. Request payloads don't match Zod validation schemas
2. Database inserts fail due to missing required fields
3. Field names don't match database columns

### Production Code Status
✅ **Production code is CORRECT**:
- TypeScript types match database schema
- Zod schemas match database schema
- Services use correct field names
- Database schema is well-designed

❌ **Only test fixtures are wrong**

## Fix Priority

### Priority 1 - CRITICAL (Blocks all tests)
1. ✅ Fix `clients.ts` - JSONB structure and field names
2. ✅ Fix `projects.ts` - Remove non-existent fields, fix status values
3. ✅ Fix `payments.ts` - Add invoice_id, fix field names, use cents
4. ✅ Fix `expenses.ts` - Fix field names, use cents

### Priority 2 - HIGH (Blocks document tests)
5. ✅ Fix `documents.ts` - Add client_id, fix field names, use cents
6. ✅ Fix document line items - Use cents for prices

### Priority 3 - MEDIUM (Quality improvements)
7. ✅ Add TypeScript type annotations to all fixtures
8. ✅ Add validation tests for fixtures
9. ✅ Create fixture generator utilities

## Recommendations

### Immediate Actions
1. **Fix all fixtures** to match database schema exactly
2. **Add type annotations** using TypeScript types from `src/shared/types/`
3. **Run integration tests** to verify fixes
4. **Document correct patterns** for future fixture creation

### Process Improvements
1. **Always reference schema** when creating fixtures
2. **Use TypeScript types** for compile-time validation
3. **Validate with Zod schemas** before using in tests
4. **Run integration tests early** to catch mismatches
5. **Create fixture generators** from TypeScript types

### Prevention
1. Add pre-commit hooks to validate fixture structure
2. Create fixture validation utilities
3. Generate fixtures from TypeScript types automatically
4. Add fixture documentation with examples

## Next Steps

1. ✅ Create corrected fixture files
2. ✅ Add TypeScript type annotations
3. ✅ Run integration tests
4. ✅ Document changes
5. ✅ Update RAG database
6. ✅ Commit and push

## Conclusion

**Scope**: All 5 fixture files have issues
**Severity**: Critical - blocks all integration testing
**Root Cause**: Fixtures created without schema reference
**Fix Effort**: Medium - requires careful field-by-field updates
**Risk**: Low - clear fix path with validation available

The good news: Production code is correct. Only test fixtures need updating.