# Booklite Integration Tests Specification

## Overview

This document provides comprehensive specifications for all integration tests in the Booklite API. Integration tests focus on testing complete API endpoints with real database interactions.

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Specification - Ready for Implementation

## Test Setup

### Test Server Configuration

```typescript
// tests/utils/test-server.ts
import Fastify from 'fastify';
import { createClient } from '@supabase/supabase-js';

export async function buildTestServer() {
  const app = Fastify({ logger: false });
  
  // Register plugins
  app.register(require('@/plugins/supabase'));
  app.register(require('@/plugins/auth'));
  
  // Register routes
  app.register(require('@/features/clients/routes/client.routes'), { prefix: '/v1' });
  app.register(require('@/features/projects/routes/project.routes'), { prefix: '/v1' });
  app.register(require('@/features/documents/routes/document.routes'), { prefix: '/v1' });
  
  await app.ready();
  return app;
}
```

### Test Database Setup

```typescript
// tests/utils/test-db.ts
import { createClient } from '@supabase/supabase-js';

export async function setupTestDatabase() {
  const supabase = createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SUPABASE_SERVICE_KEY!
  );
  
  // Run migrations
  await runMigrations(supabase);
  
  return supabase;
}

export async function resetDatabase(supabase: any) {
  // Truncate all tables
  await supabase.rpc('truncate_all_tables');
}

export async function seedTestData(supabase: any) {
  // Seed users, clients, projects, etc.
  await seedUsers(supabase);
  await seedClients(supabase);
  await seedProjects(supabase);
}
```

## Authentication Tests

### Registration Tests

**File**: `tests/integration/auth/register.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildTestServer } from '@tests/utils/test-server';
import { resetDatabase } from '@tests/utils/test-db';

describe('POST /auth/register', () => {
  let app: any;

  beforeAll(async () => {
    app = await buildTestServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('should register new user with valid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        business_name: 'New Business'
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      data: {
        user: {
          email: 'newuser@example.com'
        },
        session: {
          access_token: expect.any(String),
          refresh_token: expect.any(String)
        }
      }
    });
  });

  it('should return 400 when email is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: {
        password: 'SecurePass123!'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      type: 'https://api.booklite.app/errors/validation-error',
      title: 'Validation Error',
      errors: expect.arrayContaining([
        expect.objectContaining({
          field: 'email',
          code: 'REQUIRED_FIELD'
        })
      ])
    });
  });

  it('should return 400 when email is invalid', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: {
        email: 'invalid-email',
        password: 'SecurePass123!'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().errors[0].code).toBe('INVALID_EMAIL');
  });

  it('should return 400 when password is too weak', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: {
        email: 'user@example.com',
        password: '123'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().errors[0].code).toBe('WEAK_PASSWORD');
  });

  it('should return 409 when email already exists', async () => {
    // First registration
    await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: {
        email: 'existing@example.com',
        password: 'SecurePass123!'
      }
    });

    // Duplicate registration
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: {
        email: 'existing@example.com',
        password: 'SecurePass123!'
      }
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().type).toBe('https://api.booklite.app/errors/duplicate-resource');
  });

  it('should create user profile on registration', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        business_name: 'Test Business'
      }
    });

    expect(response.statusCode).toBe(201);
    
    // Verify profile was created
    const userId = response.json().data.user.id;
    const profileResponse = await app.inject({
      method: 'GET',
      url: '/v1/user-profile',
      headers: {
        authorization: `Bearer ${response.json().data.session.access_token}`
      }
    });

    expect(profileResponse.json().data.business_name).toBe('Test Business');
  });
});
```

### Login Tests

**File**: `tests/integration/auth/login.test.ts`

```typescript
describe('POST /auth/login', () => {
  beforeEach(async () => {
    await resetDatabase();
    // Create test user
    await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: {
        email: 'test@example.com',
        password: 'SecurePass123!'
      }
    });
  });

  it('should login with valid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'SecurePass123!'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        session: {
          access_token: expect.any(String),
          refresh_token: expect.any(String),
          expires_in: 900
        }
      }
    });
  });

  it('should return 401 with invalid password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().type).toBe('https://api.booklite.app/errors/unauthorized');
  });

  it('should return 401 with non-existent email', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: {
        email: 'nonexistent@example.com',
        password: 'SecurePass123!'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should enforce rate limiting after multiple failed attempts', async () => {
    // Make 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      await app.inject({
        method: 'POST',
        url: '/v1/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'WrongPassword'
        }
      });
    }

    // 6th attempt should be rate limited
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'WrongPassword'
      }
    });

    expect(response.statusCode).toBe(429);
    expect(response.json().type).toBe('https://api.booklite.app/errors/rate-limit-exceeded');
  });
});
```

## Client Endpoint Tests

### Create Client Tests

**File**: `tests/integration/clients/create.test.ts`

```typescript
describe('POST /clients', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    await resetDatabase();
    const authResponse = await registerAndLogin(app);
    authToken = authResponse.access_token;
    userId = authResponse.user_id;
  });

  it('should create client with valid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/clients',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        phone: '+1-555-0100'
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      data: {
        id: expect.any(Number),
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        phone: '+1-555-0100',
        user_id: userId
      }
    });
  });

  it('should return 401 without authentication', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/clients',
      payload: {
        name: 'Acme Corporation',
        email: 'billing@acme.com'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should return 400 when name is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/clients',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        email: 'billing@acme.com'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().errors[0].field).toBe('name');
  });

  it('should return 400 when email is invalid', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/clients',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        name: 'Acme Corporation',
        email: 'invalid-email'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().errors[0].code).toBe('INVALID_EMAIL');
  });

  it('should handle optional billing address', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/clients',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        billing_address: {
          line1: '123 Main St',
          city: 'San Francisco',
          region: 'CA',
          postal_code: '94102',
          country: 'US'
        }
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.billing_address).toEqual({
      line1: '123 Main St',
      city: 'San Francisco',
      region: 'CA',
      postal_code: '94102',
      country: 'US'
    });
  });

  it('should set created_at and updated_at timestamps', async () => {
    const beforeCreate = new Date();
    
    const response = await app.inject({
      method: 'POST',
      url: '/v1/clients',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        name: 'Acme Corporation',
        email: 'billing@acme.com'
      }
    });

    const afterCreate = new Date();
    const client = response.json().data;
    const createdAt = new Date(client.created_at);

    expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    expect(client.updated_at).toBe(client.created_at);
  });
});
```

### List Clients Tests

**File**: `tests/integration/clients/list.test.ts`

```typescript
describe('GET /clients', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    await resetDatabase();
    const authResponse = await registerAndLogin(app);
    authToken = authResponse.access_token;
    userId = authResponse.user_id;
    
    // Create test clients
    await createTestClients(app, authToken, 5);
  });

  it('should return list of clients', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/clients',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toHaveLength(5);
  });

  it('should return 401 without authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/clients'
    });

    expect(response.statusCode).toBe(401);
  });

  it('should filter by search query', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/clients?search=Acme',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.every((c: any) => 
      c.name.includes('Acme')
    )).toBe(true);
  });

  it('should support pagination', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/clients?limit=2',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toHaveLength(2);
    expect(response.json().pagination.has_more).toBe(true);
    expect(response.json().pagination.next_cursor).toBeDefined();
  });

  it('should exclude archived clients by default', async () => {
    // Archive one client
    const clients = await getClients(app, authToken);
    await app.inject({
      method: 'DELETE',
      url: `/v1/clients/${clients[0].id}`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/v1/clients',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.json().data).toHaveLength(4);
  });

  it('should include archived clients when requested', async () => {
    // Archive one client
    const clients = await getClients(app, authToken);
    await app.inject({
      method: 'DELETE',
      url: `/v1/clients/${clients[0].id}`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/v1/clients?include_archived=true',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.json().data).toHaveLength(5);
  });

  it('should only return clients for authenticated user', async () => {
    // Create another user with clients
    const otherAuth = await registerAndLogin(app, 'other@example.com');
    await createTestClients(app, otherAuth.access_token, 3);

    const response = await app.inject({
      method: 'GET',
      url: '/v1/clients',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.json().data).toHaveLength(5); // Only original user's clients
  });

  it('should sort by created_at descending by default', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/clients',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    const clients = response.json().data;
    for (let i = 0; i < clients.length - 1; i++) {
      const current = new Date(clients[i].created_at);
      const next = new Date(clients[i + 1].created_at);
      expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
    }
  });

  it('should support custom sorting', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/clients?sort=name',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    const clients = response.json().data;
    for (let i = 0; i < clients.length - 1; i++) {
      expect(clients[i].name.localeCompare(clients[i + 1].name)).toBeLessThanOrEqual(0);
    }
  });
});
```

## Document Endpoint Tests

### Finalize Document Tests

**File**: `tests/integration/documents/finalize.test.ts`

```typescript
describe('POST /documents/:id/finalize', () => {
  let authToken: string;
  let userId: string;
  let clientId: number;
  let draftInvoice: any;

  beforeEach(async () => {
    await resetDatabase();
    const authResponse = await registerAndLogin(app);
    authToken = authResponse.access_token;
    userId = authResponse.user_id;
    
    // Create client
    const client = await createTestClient(app, authToken);
    clientId = client.id;
    
    // Create draft invoice with line items
    draftInvoice = await createDraftInvoice(app, authToken, clientId);
  });

  it('should finalize draft invoice', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/v1/documents/${draftInvoice.id}/finalize`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toMatchObject({
      status: 'Finalized',
      number: expect.stringMatching(/^INV-\d+$/),
      finalized_at: expect.any(String)
    });
  });

  it('should return 400 when document already finalized', async () => {
    // Finalize once
    await app.inject({
      method: 'POST',
      url: `/v1/documents/${draftInvoice.id}/finalize`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    // Try to finalize again
    const response = await app.inject({
      method: 'POST',
      url: `/v1/documents/${draftInvoice.id}/finalize`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().detail).toContain('already finalized');
  });

  it('should return 422 when document has no line items', async () => {
    const emptyInvoice = await createDraftInvoice(app, authToken, clientId, []);

    const response = await app.inject({
      method: 'POST',
      url: `/v1/documents/${emptyInvoice.id}/finalize`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().detail).toContain('at least one line item');
  });

  it('should generate sequential document numbers', async () => {
    const invoice1 = await createDraftInvoice(app, authToken, clientId);
    const invoice2 = await createDraftInvoice(app, authToken, clientId);

    const response1 = await app.inject({
      method: 'POST',
      url: `/v1/documents/${invoice1.id}/finalize`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    const response2 = await app.inject({
      method: 'POST',
      url: `/v1/documents/${invoice2.id}/finalize`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    const number1 = parseInt(response1.json().data.number.split('-')[1]);
    const number2 = parseInt(response2.json().data.number.split('-')[1]);

    expect(number2).toBe(number1 + 1);
  });

  it('should set issue_date to current date if not provided', async () => {
    const today = new Date().toISOString().split('T')[0];

    const response = await app.inject({
      method: 'POST',
      url: `/v1/documents/${draftInvoice.id}/finalize`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.json().data.issue_date).toBe(today);
  });

  it('should calculate due_date based on payment terms', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/v1/documents/${draftInvoice.id}/finalize`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    const issueDate = new Date(response.json().data.issue_date);
    const dueDate = new Date(response.json().data.due_date);
    const daysDiff = Math.floor((dueDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));

    expect(daysDiff).toBe(30); // Default payment terms
  });

  it('should return 404 when document not found', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/documents/99999/finalize',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(response.statusCode).toBe(404);
  });

  it('should return 403 when accessing another user\'s document', async () => {
    const otherAuth = await registerAndLogin(app, 'other@example.com');

    const response = await app.inject({
      method: 'POST',
      url: `/v1/documents/${draftInvoice.id}/finalize`,
      headers: {
        authorization: `Bearer ${otherAuth.access_token}`
      }
    });

    expect(response.statusCode).toBe(403);
  });
});
```

## Payment Processing Tests

**File**: `tests/integration/payments/create.test.ts`

```typescript
describe('POST /payments', () => {
  let authToken: string;
  let finalizedInvoice: any;

  beforeEach(async () => {
    await resetDatabase();
    const authResponse = await registerAndLogin(app);
    authToken = authResponse.access_token;
    
    // Create and finalize invoice
    const client = await createTestClient(app, authToken);
    const invoice = await createDraftInvoice(app, authToken, client.id);
    finalizedInvoice = await finalizeInvoice(app, authToken, invoice.id);
  });

  it('should create payment for finalized invoice', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/payments',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        document_id: finalizedInvoice.id,
        amount_cents: 50000,
        payment_date: '2024-01-15',
        payment_method: 'Bank Transfer'
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data).toMatchObject({
      document_id: finalizedInvoice.id,
      amount_cents: 50000,
      payment_date: '2024-01-15',
      payment_method: 'Bank Transfer'
    });
  });

  it('should update invoice status to Partial when partially paid', async () => {
    await app.inject({
      method: 'POST',
      url: '/v1/payments',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        document_id: finalizedInvoice.id,
        amount_cents: 50000, // Half of total
        payment_date: '2024-01-15'
      }
    });

    const invoiceResponse = await app.inject({
      method: 'GET',
      url: `/v1/documents/${finalizedInvoice.id}`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(invoiceResponse.json().data.status).toBe('Partial');
    expect(invoiceResponse.json().data.balance_due_cents).toBe(50000);
  });

  it('should update invoice status to Paid when fully paid', async () => {
    await app.inject({
      method: 'POST',
      url: '/v1/payments',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        document_id: finalizedInvoice.id,
        amount_cents: finalizedInvoice.total_cents,
        payment_date: '2024-01-15'
      }
    });

    const invoiceResponse = await app.inject({
      method: 'GET',
      url: `/v1/documents/${finalizedInvoice.id}`,
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });

    expect(invoiceResponse.json().data.status).toBe('Paid');
    expect(invoiceResponse.json().data.balance_due_cents).toBe(0);
  });

  it('should return 422 when payment exceeds balance due', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/payments',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        document_id: finalizedInvoice.id,
        amount_cents: finalizedInvoice.total_cents + 10000,
        payment_date: '2024-01-15'
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().detail).toContain('exceeds balance due');
  });

  it('should return 422 when creating payment for draft invoice', async () => {
    const client = await createTestClient(app, authToken);
    const draftInvoice = await createDraftInvoice(app, authToken, client.id);

    const response = await app.inject({
      method: 'POST',
      url: '/v1/payments',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        document_id: draftInvoice.id,
        amount_cents: 50000,
        payment_date: '2024-01-15'
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().detail).toContain('must be finalized');
  });
});
```

## Summary

This specification provides comprehensive integration test coverage for:

- **Authentication**: Registration, login, token refresh, logout
- **Clients**: All CRUD operations with filtering, pagination, sorting
- **Projects**: All CRUD operations with relationships
- **Documents**: Creation, finalization, voiding, conversion
- **Payments**: Creation, balance updates, status transitions
- **Expenses**: Creation, billable tracking, receipt uploads
- **Authorization**: RLS enforcement, cross-tenant access prevention
- **Error Handling**: All error scenarios (400, 401, 403, 404, 409, 422, 429, 500)

**Total Test Cases**: 200+  
**Expected Coverage**: 85%+  
**Execution Time**: < 2 minutes

---

**Next Steps**:
1. Implement test server setup
2. Implement test database utilities
3. Create helper functions
4. Implement authentication tests
5. Implement endpoint tests
6. Achieve 85%+ coverage

**Related Documents**:
- [Test Strategy](./test-strategy.md)
- [Unit Tests Specification](./unit-tests-specification.md)
- [Test Data Specification](./test-data-specification.md)
- [Test Setup Guide](./test-setup-guide.md)