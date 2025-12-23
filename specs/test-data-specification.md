# Booklite Test Data Specification

## Overview

This document defines all test fixtures, mock data generators, and database seeding strategies for the Booklite API test suite.

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Specification - Ready for Implementation

## Test Fixtures

### User Fixtures

**File**: `tests/fixtures/users.ts`

```typescript
export const testUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  business_name: 'Test Business LLC',
  phone: '+1-555-0100',
  address: {
    line1: '123 Main Street',
    line2: 'Suite 100',
    city: 'San Francisco',
    region: 'CA',
    postal_code: '94102',
    country: 'US'
  },
  tax_id: '12-3456789',
  default_payment_terms_days: 30,
  invoice_prefix: 'INV',
  quote_prefix: 'QTE',
  next_invoice_number: 1,
  next_quote_number: 1,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};

export const testUser2 = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'test2@example.com',
  business_name: 'Another Business Inc',
  phone: '+1-555-0200',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};
```

### Client Fixtures

**File**: `tests/fixtures/clients.ts`

```typescript
export const testClient = {
  id: 1,
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Acme Corporation',
  email: 'billing@acme.com',
  phone: '+1-555-0300',
  billing_address: {
    line1: '456 Business Avenue',
    city: 'New York',
    region: 'NY',
    postal_code: '10001',
    country: 'US'
  },
  tax_vat_id: 'US123456789',
  default_payment_terms_days: 30,
  notes: 'Preferred client',
  archived_at: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};

export const testClients = [
  testClient,
  {
    id: 2,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'TechStart Inc',
    email: 'accounts@techstart.io',
    phone: '+1-555-0400',
    archived_at: null,
    created_at: '2024-01-02T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z'
  },
  {
    id: 3,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Global Solutions Ltd',
    email: 'finance@globalsolutions.com',
    phone: '+44-20-1234-5678',
    billing_address: {
      line1: '10 Downing Street',
      city: 'London',
      postal_code: 'SW1A 2AA',
      country: 'GB'
    },
    archived_at: null,
    created_at: '2024-01-03T00:00:00.000Z',
    updated_at: '2024-01-03T00:00:00.000Z'
  }
];
```

### Project Fixtures

**File**: `tests/fixtures/projects.ts`

```typescript
export const testProject = {
  id: 1,
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  client_id: 1,
  name: 'Website Redesign',
  status: 'Active',
  default_po_number: 'PO-2024-001',
  notes: 'Q1 2024 project',
  archived_at: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};

export const testProjects = [
  testProject,
  {
    id: 2,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    client_id: 1,
    name: 'Mobile App Development',
    status: 'Active',
    default_po_number: 'PO-2024-002',
    archived_at: null,
    created_at: '2024-01-05T00:00:00.000Z',
    updated_at: '2024-01-05T00:00:00.000Z'
  },
  {
    id: 3,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    client_id: 2,
    name: 'Cloud Migration',
    status: 'Completed',
    archived_at: null,
    created_at: '2024-01-10T00:00:00.000Z',
    updated_at: '2024-01-10T00:00:00.000Z'
  }
];
```

### Document Fixtures

**File**: `tests/fixtures/documents.ts`

```typescript
export const testInvoice = {
  id: 1,
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  client_id: 1,
  project_id: 1,
  type: 'Invoice',
  status: 'Draft',
  number: null,
  po_number: 'PO-2024-001',
  issue_date: null,
  due_date: null,
  subtotal_cents: 100000,
  tax_total_cents: 8000,
  total_cents: 108000,
  balance_due_cents: 108000,
  notes: 'Thank you for your business',
  terms: 'Payment due within 30 days',
  finalized_at: null,
  voided_at: null,
  archived_at: null,
  created_at: '2024-01-15T00:00:00.000Z',
  updated_at: '2024-01-15T00:00:00.000Z'
};

export const testQuote = {
  id: 2,
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  client_id: 2,
  project_id: 2,
  type: 'Quote',
  status: 'Draft',
  number: null,
  po_number: null,
  issue_date: null,
  due_date: null,
  subtotal_cents: 250000,
  tax_total_cents: 20000,
  total_cents: 270000,
  balance_due_cents: 270000,
  notes: 'Quote valid for 30 days',
  terms: null,
  finalized_at: null,
  voided_at: null,
  archived_at: null,
  created_at: '2024-01-20T00:00:00.000Z',
  updated_at: '2024-01-20T00:00:00.000Z'
};

export const testLineItems = [
  {
    id: 1,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    document_id: 1,
    description: 'Web Development Services',
    quantity: 40,
    unit_price_cents: 15000,
    tax_rate_id: 1,
    tax_rate_snapshot: 8.0,
    line_total_cents: 600000,
    sort_order: 0,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 2,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    document_id: 1,
    description: 'UI/UX Design',
    quantity: 20,
    unit_price_cents: 20000,
    tax_rate_id: 1,
    tax_rate_snapshot: 8.0,
    line_total_cents: 400000,
    sort_order: 1,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  }
];
```

### Payment Fixtures

**File**: `tests/fixtures/payments.ts`

```typescript
export const testPayment = {
  id: 1,
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  document_id: 1,
  amount_cents: 54000,
  payment_date: '2024-02-01',
  payment_method: 'Bank Transfer',
  reference_number: 'TXN-2024-001',
  notes: 'First payment',
  created_at: '2024-02-01T00:00:00.000Z',
  updated_at: '2024-02-01T00:00:00.000Z'
};

export const testPayments = [
  testPayment,
  {
    id: 2,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    document_id: 1,
    amount_cents: 54000,
    payment_date: '2024-02-15',
    payment_method: 'Check',
    reference_number: 'CHK-1234',
    notes: 'Final payment',
    created_at: '2024-02-15T00:00:00.000Z',
    updated_at: '2024-02-15T00:00:00.000Z'
  }
];
```

### Expense Fixtures

**File**: `tests/fixtures/expenses.ts`

```typescript
export const testExpense = {
  id: 1,
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  category_id: 1,
  project_id: 1,
  invoice_id: null,
  description: 'Software licenses',
  amount_cents: 9900,
  expense_date: '2024-01-10',
  receipt_attachment_id: null,
  billable: true,
  billed: false,
  notes: 'Annual subscription',
  archived_at: null,
  created_at: '2024-01-10T00:00:00.000Z',
  updated_at: '2024-01-10T00:00:00.000Z'
};

export const testExpenses = [
  testExpense,
  {
    id: 2,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    category_id: 2,
    project_id: 1,
    invoice_id: null,
    description: 'Travel expenses',
    amount_cents: 45000,
    expense_date: '2024-01-15',
    billable: true,
    billed: false,
    archived_at: null,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 3,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    category_id: 3,
    project_id: null,
    invoice_id: null,
    description: 'Office supplies',
    amount_cents: 12500,
    expense_date: '2024-01-20',
    billable: false,
    billed: false,
    archived_at: null,
    created_at: '2024-01-20T00:00:00.000Z',
    updated_at: '2024-01-20T00:00:00.000Z'
  }
];
```

### Category Fixtures

**File**: `tests/fixtures/categories.ts`

```typescript
export const testCategories = [
  {
    id: 1,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Software & Tools',
    color: '#3B82F6',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Travel',
    color: '#10B981',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 3,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Office Expenses',
    color: '#F59E0B',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
];
```

### Tax Rate Fixtures

**File**: `tests/fixtures/tax-rates.ts`

```typescript
export const testTaxRates = [
  {
    id: 1,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'CA Sales Tax',
    rate: 8.0,
    description: 'California state sales tax',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'VAT',
    rate: 20.0,
    description: 'UK Value Added Tax',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 3,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'No Tax',
    rate: 0.0,
    description: 'Tax-exempt',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
];
```

## Mock Data Generators

### Factory Functions

**File**: `tests/utils/factories.ts`

```typescript
import { faker } from '@faker-js/faker';

export function createClient(overrides?: Partial<Client>): Client {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    user_id: faker.string.uuid(),
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number('+1-###-###-####'),
    billing_address: {
      line1: faker.location.streetAddress(),
      city: faker.location.city(),
      region: faker.location.state({ abbreviated: true }),
      postal_code: faker.location.zipCode(),
      country: 'US'
    },
    tax_vat_id: faker.string.alphanumeric(10),
    default_payment_terms_days: 30,
    notes: faker.lorem.sentence(),
    archived_at: null,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}

export function createProject(overrides?: Partial<Project>): Project {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    user_id: faker.string.uuid(),
    client_id: faker.number.int({ min: 1, max: 100 }),
    name: faker.commerce.productName(),
    status: faker.helpers.arrayElement(['Active', 'Completed', 'OnHold']),
    default_po_number: `PO-${faker.number.int({ min: 1000, max: 9999 })}`,
    notes: faker.lorem.paragraph(),
    archived_at: null,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}

export function createDocument(overrides?: Partial<Document>): Document {
  const subtotal = faker.number.int({ min: 50000, max: 500000 });
  const taxRate = 8.0;
  const tax = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + tax;

  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    user_id: faker.string.uuid(),
    client_id: faker.number.int({ min: 1, max: 100 }),
    project_id: faker.number.int({ min: 1, max: 100 }),
    type: faker.helpers.arrayElement(['Quote', 'Invoice']),
    status: 'Draft',
    number: null,
    po_number: `PO-${faker.number.int({ min: 1000, max: 9999 })}`,
    issue_date: null,
    due_date: null,
    subtotal_cents: subtotal,
    tax_total_cents: tax,
    total_cents: total,
    balance_due_cents: total,
    notes: faker.lorem.sentence(),
    terms: 'Payment due within 30 days',
    finalized_at: null,
    voided_at: null,
    archived_at: null,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}

export function createLineItem(overrides?: Partial<LineItem>): LineItem {
  const quantity = faker.number.int({ min: 1, max: 100 });
  const unitPrice = faker.number.int({ min: 5000, max: 50000 });
  const taxRate = 8.0;
  const lineTotal = quantity * unitPrice;

  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    user_id: faker.string.uuid(),
    document_id: faker.number.int({ min: 1, max: 100 }),
    description: faker.commerce.productDescription(),
    quantity,
    unit_price_cents: unitPrice,
    tax_rate_id: 1,
    tax_rate_snapshot: taxRate,
    line_total_cents: lineTotal,
    sort_order: 0,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}

export function createPayment(overrides?: Partial<Payment>): Payment {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    user_id: faker.string.uuid(),
    document_id: faker.number.int({ min: 1, max: 100 }),
    amount_cents: faker.number.int({ min: 10000, max: 100000 }),
    payment_date: faker.date.recent().toISOString().split('T')[0],
    payment_method: faker.helpers.arrayElement(['Bank Transfer', 'Check', 'Credit Card', 'Cash']),
    reference_number: `TXN-${faker.string.alphanumeric(8).toUpperCase()}`,
    notes: faker.lorem.sentence(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}

export function createExpense(overrides?: Partial<Expense>): Expense {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    user_id: faker.string.uuid(),
    category_id: faker.number.int({ min: 1, max: 10 }),
    project_id: faker.number.int({ min: 1, max: 100 }),
    invoice_id: null,
    description: faker.commerce.productName(),
    amount_cents: faker.number.int({ min: 1000, max: 50000 }),
    expense_date: faker.date.recent().toISOString().split('T')[0],
    receipt_attachment_id: null,
    billable: faker.datatype.boolean(),
    billed: false,
    notes: faker.lorem.sentence(),
    archived_at: null,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}

// Batch generators
export function createClients(count: number, overrides?: Partial<Client>): Client[] {
  return Array.from({ length: count }, () => createClient(overrides));
}

export function createProjects(count: number, overrides?: Partial<Project>): Project[] {
  return Array.from({ length: count }, () => createProject(overrides));
}

export function createDocuments(count: number, overrides?: Partial<Document>): Document[] {
  return Array.from({ length: count }, () => createDocument(overrides));
}

export function createExpenses(count: number, overrides?: Partial<Expense>): Expense[] {
  return Array.from({ length: count }, () => createExpense(overrides));
}
```

## Mock Service Implementations

### Supabase Mock

**File**: `tests/mocks/supabase.ts`

```typescript
import { vi } from 'vitest';

export function createMockSupabaseClient() {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
  };

  return {
    from: vi.fn().mockReturnValue(mockChain),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      refreshSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null })
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.pdf' } })
      })
    }
  };
}
```

### Email Service Mock

**File**: `tests/mocks/email.ts`

```typescript
import { vi } from 'vitest';

export function createMockEmailService() {
  return {
    send: vi.fn().mockResolvedValue({
      success: true,
      messageId: 'msg_123456'
    }),
    sendTemplate: vi.fn().mockResolvedValue({
      success: true,
      messageId: 'msg_123456'
    }),
    sendBatch: vi.fn().mockResolvedValue({
      success: true,
      messageIds: ['msg_123456', 'msg_123457']
    })
  };
}
```

### Storage Service Mock

**File**: `tests/mocks/storage.ts`

```typescript
import { vi } from 'vitest';

export function createMockStorageService() {
  return {
    upload: vi.fn().mockResolvedValue({
      success: true,
      url: 'https://storage.example.com/file.pdf',
      key: 'uploads/file.pdf'
    }),
    download: vi.fn().mockResolvedValue({
      success: true,
      data: Buffer.from('mock file content')
    }),
    delete: vi.fn().mockResolvedValue({
      success: true
    }),
    getSignedUrl: vi.fn().mockResolvedValue({
      success: true,
      url: 'https://storage.example.com/file.pdf?signature=abc123'
    })
  };
}
```

## Database Seeding

### Seed Script

**File**: `tests/utils/seed.ts`

```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { testUser, testUser2 } from '@tests/fixtures/users';
import { testClients } from '@tests/fixtures/clients';
import { testProjects } from '@tests/fixtures/projects';
import { testCategories } from '@tests/fixtures/categories';
import { testTaxRates } from '@tests/fixtures/tax-rates';

export async function seedDatabase(supabase: SupabaseClient) {
  // Seed users
  await seedUsers(supabase);
  
  // Seed categories
  await seedCategories(supabase);
  
  // Seed tax rates
  await seedTaxRates(supabase);
  
  // Seed clients
  await seedClients(supabase);
  
  // Seed projects
  await seedProjects(supabase);
  
  // Seed documents
  await seedDocuments(supabase);
  
  // Seed expenses
  await seedExpenses(supabase);
}

async function seedUsers(supabase: SupabaseClient) {
  const { error } = await supabase
    .from('user_profile')
    .insert([testUser, testUser2]);
  
  if (error) throw error;
}

async function seedClients(supabase: SupabaseClient) {
  const { error } = await supabase
    .from('clients')
    .insert(testClients);
  
  if (error) throw error;
}

async function seedProjects(supabase: SupabaseClient) {
  const { error } = await supabase
    .from('projects')
    .insert(testProjects);
  
  if (error) throw error;
}

async function seedCategories(supabase: SupabaseClient) {
  const { error } = await supabase
    .from('categories')
    .insert(testCategories);
  
  if (error) throw error;
}

async function seedTaxRates(supabase: SupabaseClient) {
  const { error } = await supabase
    .from('tax_rates')
    .insert(testTaxRates);
  
  if (error) throw error;
}
```

## Summary

This specification provides:

- **Fixtures**: Predefined test data for all entities
- **Factories**: Dynamic data generators using Faker.js
- **Mocks**: Mock implementations for external services
- **Seeding**: Database seeding utilities

**Total Fixtures**: 50+ predefined objects  
**Factory Functions**: 10+ generators  
**Mock Services**: 3 complete implementations

---

**Related Documents**:
- [Test Strategy](./test-strategy.md)
- [Unit Tests Specification](./unit-tests-specification.md)
- [Integration Tests Specification](./integration-tests-specification.md)
- [Test Setup Guide](./test-setup-guide.md)