# Test Suite Generation Prompt

## Context

Generate comprehensive test suites for the Booklite API based on the specifications below.

## Technology Stack

- **Testing Framework**: Vitest (Unit Tests)
- **Backend Language**: TypeScript
- **API Framework**: Fastify
- **Database**: PostgreSQL (Supabase)
- **Validation**: Zod schemas
- **Authentication**: Supabase Auth (JWT)

## API Specification Summary

### Base Configuration
- **Base URL**: `https://api.booklite.app/v1`
- **Authentication**: JWT Bearer tokens
- **Content-Type**: application/json
- **Rate Limiting**: 
  - Global: 100 requests/minute per IP
  - Per-User: 1000 requests/hour
  - Auth: 5 requests/minute per IP

### Core Entities (14 Total)
1. **user_profile** - User settings and preferences
2. **clients** - Client management
3. **projects** - Project tracking
4. **documents** - Quotes and invoices
5. **document_line_items** - Line items for documents
6. **payments** - Payment tracking
7. **expenses** - Expense management
8. **categories** - Expense categories
9. **tax_rates** - Tax rate definitions
10. **attachments** - File uploads
11. **email_logs** - Email tracking
12. **official_copies** - Document snapshots
13. **audit_logs** - Audit trail
14. **user_sessions** - Session management

### API Endpoints (80+ Total)

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token
- `POST /auth/verify-email` - Verify email
- `POST /auth/reset-password` - Reset password

#### User Profile
- `GET /user-profile` - Get profile
- `PUT /user-profile` - Update profile
- `POST /user-profile/logo` - Upload logo

#### Clients
- `GET /clients` - List clients
- `POST /clients` - Create client
- `GET /clients/:id` - Get client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Archive client
- `GET /clients/:id/documents` - Get client documents
- `GET /clients/:id/projects` - Get client projects

#### Projects
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Archive project
- `GET /projects/:id/documents` - Get project documents
- `GET /projects/:id/expenses` - Get project expenses

#### Documents (Quotes & Invoices)
- `GET /documents` - List documents
- `POST /documents` - Create document
- `GET /documents/:id` - Get document
- `PUT /documents/:id` - Update document
- `DELETE /documents/:id` - Archive document
- `POST /documents/:id/finalize` - Finalize document
- `POST /documents/:id/send` - Send document via email
- `POST /documents/:id/void` - Void invoice
- `POST /documents/:id/convert` - Convert quote to invoice
- `GET /documents/:id/pdf` - Download PDF

#### Payments
- `GET /payments` - List payments
- `POST /payments` - Create payment
- `GET /payments/:id` - Get payment
- `PUT /payments/:id` - Update payment
- `DELETE /payments/:id` - Delete payment

#### Expenses
- `GET /expenses` - List expenses
- `POST /expenses` - Create expense
- `GET /expenses/:id` - Get expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Archive expense
- `POST /expenses/:id/receipt` - Upload receipt

#### Categories
- `GET /categories` - List categories
- `POST /categories` - Create category
- `GET /categories/:id` - Get category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

#### Tax Rates
- `GET /tax-rates` - List tax rates
- `POST /tax-rates` - Create tax rate
- `GET /tax-rates/:id` - Get tax rate
- `PUT /tax-rates/:id` - Update tax rate
- `DELETE /tax-rates/:id` - Delete tax rate

#### Attachments
- `POST /attachments` - Upload file
- `GET /attachments/:id` - Download file
- `DELETE /attachments/:id` - Delete file

#### Reports
- `GET /reports/revenue` - Revenue report
- `GET /reports/expenses` - Expense report
- `GET /reports/profit-loss` - P&L report
- `GET /reports/tax-summary` - Tax summary

### Database Schema Summary

#### Core Tables

**user_profile**
```sql
CREATE TABLE user_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  business_name varchar(200),
  email varchar(255) NOT NULL,
  phone varchar(50),
  address jsonb,
  tax_id varchar(50),
  logo_attachment_id bigint,
  default_tax_rate_id bigint,
  default_payment_terms_days int DEFAULT 30,
  invoice_prefix varchar(20) DEFAULT 'INV',
  quote_prefix varchar(20) DEFAULT 'QTE',
  next_invoice_number int DEFAULT 1,
  next_quote_number int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**clients**
```sql
CREATE TABLE clients (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name varchar(200) NOT NULL,
  email varchar(255),
  phone varchar(50),
  billing_address jsonb,
  tax_vat_id varchar(50),
  default_tax_rate_id bigint,
  default_payment_terms_days int,
  notes text,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**projects**
```sql
CREATE TABLE projects (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  client_id bigint NOT NULL REFERENCES clients(id),
  name varchar(200) NOT NULL,
  status varchar(20) DEFAULT 'Active',
  default_po_number varchar(100),
  notes text,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**documents**
```sql
CREATE TABLE documents (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  client_id bigint NOT NULL REFERENCES clients(id),
  project_id bigint REFERENCES projects(id),
  type varchar(20) NOT NULL CHECK (type IN ('Quote', 'Invoice')),
  status varchar(20) NOT NULL DEFAULT 'Draft',
  number varchar(50),
  po_number varchar(100),
  issue_date date,
  due_date date,
  subtotal_cents bigint DEFAULT 0,
  tax_total_cents bigint DEFAULT 0,
  total_cents bigint DEFAULT 0,
  balance_due_cents bigint DEFAULT 0,
  notes text,
  terms text,
  finalized_at timestamptz,
  voided_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**document_line_items**
```sql
CREATE TABLE document_line_items (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  document_id bigint NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price_cents bigint NOT NULL,
  tax_rate_id bigint REFERENCES tax_rates(id),
  tax_rate_snapshot numeric(5,2),
  line_total_cents bigint NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**payments**
```sql
CREATE TABLE payments (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  document_id bigint NOT NULL REFERENCES documents(id),
  amount_cents bigint NOT NULL,
  payment_date date NOT NULL,
  payment_method varchar(50),
  reference_number varchar(100),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**expenses**
```sql
CREATE TABLE expenses (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  category_id bigint REFERENCES categories(id),
  project_id bigint REFERENCES projects(id),
  invoice_id bigint REFERENCES documents(id),
  description text NOT NULL,
  amount_cents bigint NOT NULL,
  expense_date date NOT NULL,
  receipt_attachment_id bigint,
  billable boolean DEFAULT false,
  billed boolean DEFAULT false,
  notes text,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Security & Authorization

**Row Level Security (RLS)**
- All tables enforce `user_id` matching via RLS policies
- JWT `sub` claim used for user identification
- Complete data isolation between users

**Authentication Requirements**
- All endpoints require valid JWT token (except auth endpoints)
- Token must be included in Authorization header
- Token expiry: 15 minutes (access), 30 days (refresh)

**Rate Limiting**
- Global: 100 req/min per IP
- Per-user: 1000 req/hour
- Auth endpoints: 5 req/min per IP
- File uploads: 10 req/min per user

### Validation Rules

**Clients**
- name: required, 1-200 chars
- email: valid email format
- billing_address: JSON object with line1, city, country fields

**Projects**
- name: required, 1-200 chars
- status: Active, Completed, OnHold
- client_id: must exist and belong to user

**Documents**
- type: Quote or Invoice
- status: Draft, Finalized, Sent, Paid, Partial, Overdue, Void
- client_id: required, must exist
- issue_date: required when finalizing
- line_items: at least one required

**Payments**
- amount_cents: positive integer
- payment_date: required
- document_id: must be finalized invoice

**Expenses**
- description: required
- amount_cents: positive integer
- expense_date: required

## Test Requirements

### 1. Unit Tests

Create unit tests for:

#### Service Layer Functions
- **ClientService**
  - `list(userId, query)` - List clients with filtering
  - `create(userId, input)` - Create new client
  - `get(userId, id)` - Get single client
  - `update(userId, id, input)` - Update client
  - `delete(userId, id)` - Archive client
  - `getDocuments(userId, clientId)` - Get client documents
  - `getProjects(userId, clientId)` - Get client projects

- **ProjectService**
  - `list(userId, query)` - List projects
  - `create(userId, input)` - Create project
  - `get(userId, id)` - Get project
  - `update(userId, id, input)` - Update project
  - `delete(userId, id)` - Archive project

- **DocumentService**
  - `list(userId, query)` - List documents
  - `create(userId, input)` - Create document
  - `get(userId, id)` - Get document
  - `update(userId, id, input)` - Update document
  - `finalize(userId, id)` - Finalize document
  - `void(userId, id)` - Void invoice
  - `convert(userId, id)` - Convert quote to invoice
  - `calculateTotals(lineItems)` - Calculate document totals

- **PaymentService**
  - `list(userId, query)` - List payments
  - `create(userId, input)` - Create payment
  - `get(userId, id)` - Get payment
  - `update(userId, id, input)` - Update payment
  - `delete(userId, id)` - Delete payment

- **ExpenseService**
  - `list(userId, query)` - List expenses
  - `create(userId, input)` - Create expense
  - `get(userId, id)` - Get expense
  - `update(userId, id, input)` - Update expense
  - `delete(userId, id)` - Archive expense

#### Utility Functions
- **formatCurrency(cents)** - Format cents to currency string
- **parseCurrency(string)** - Parse currency string to cents
- **calculateTax(amount, rate)** - Calculate tax amount
- **generateDocumentNumber(prefix, nextNumber)** - Generate document number
- **validateEmail(email)** - Validate email format
- **validateDate(date)** - Validate date format

#### Validation Logic
- **Zod Schema Validation**
  - Test all schema validations
  - Test edge cases (min/max lengths, formats)
  - Test required vs optional fields
  - Test nested object validation

### 2. Integration Tests

Create integration tests for:

#### API Endpoints - All CRUD Operations

**Clients**
- `POST /clients` - Create client
  - Happy path: valid data
  - Error: missing required fields
  - Error: invalid email format
  - Error: duplicate client name
- `GET /clients` - List clients
  - Happy path: no filters
  - With pagination
  - With filtering (search, archived)
  - With sorting
- `GET /clients/:id` - Get client
  - Happy path: existing client
  - Error: non-existent client
  - Error: client belongs to different user
- `PUT /clients/:id` - Update client
  - Happy path: valid updates
  - Error: invalid data
  - Error: non-existent client
- `DELETE /clients/:id` - Archive client
  - Happy path: archive client
  - Error: non-existent client

**Projects**
- Similar CRUD tests as clients
- Additional: filter by client_id
- Additional: filter by status

**Documents**
- CRUD tests
- `POST /documents/:id/finalize` - Finalize document
  - Happy path: draft to finalized
  - Error: already finalized
  - Error: missing required fields
  - Error: no line items
- `POST /documents/:id/send` - Send document
  - Happy path: send email
  - Error: not finalized
- `POST /documents/:id/void` - Void invoice
  - Happy path: void paid invoice
  - Error: has balance due
  - Error: already voided
- `POST /documents/:id/convert` - Convert quote to invoice
  - Happy path: quote to invoice
  - Error: already invoice
  - Error: not finalized

**Payments**
- CRUD tests
- Test payment application to invoice
- Test balance_due_cents recalculation
- Test status updates (Paid, Partial)

**Expenses**
- CRUD tests
- Test billable flag
- Test linking to invoice
- Test receipt upload

#### Authentication Flows
- **Registration**
  - Happy path: new user
  - Error: duplicate email
  - Error: weak password
- **Login**
  - Happy path: valid credentials
  - Error: invalid credentials
  - Error: unverified email
  - Rate limiting test
- **Token Refresh**
  - Happy path: valid refresh token
  - Error: expired refresh token
  - Error: invalid refresh token
- **Logout**
  - Happy path: revoke tokens

#### Authorization Checks
- **User Isolation**
  - User A cannot access User B's data
  - Test for all endpoints
- **RLS Enforcement**
  - Verify database-level isolation
  - Test direct database queries

#### Error Handling
- **400 Bad Request**
  - Invalid JSON
  - Validation errors
  - Missing required fields
- **401 Unauthorized**
  - Missing token
  - Invalid token
  - Expired token
- **403 Forbidden**
  - Insufficient permissions
- **404 Not Found**
  - Non-existent resource
- **409 Conflict**
  - Duplicate resource
  - Constraint violation
- **422 Unprocessable Entity**
  - Business logic validation
- **429 Too Many Requests**
  - Rate limit exceeded
- **500 Internal Server Error**
  - Database errors
  - Unexpected errors

### 3. Test Data

#### Fixtures for Each Entity

**User Fixtures**
```typescript
export const testUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  business_name: 'Test Business',
  phone: '+1-555-0100',
  address: {
    line1: '123 Main St',
    city: 'San Francisco',
    region: 'CA',
    postal_code: '94102',
    country: 'US'
  }
};
```

**Client Fixtures**
```typescript
export const testClient = {
  id: 1,
  user_id: testUser.id,
  name: 'Acme Corporation',
  email: 'billing@acme.com',
  phone: '+1-555-0200',
  billing_address: {
    line1: '456 Business Ave',
    city: 'New York',
    region: 'NY',
    postal_code: '10001',
    country: 'US'
  }
};
```

**Project Fixtures**
```typescript
export const testProject = {
  id: 1,
  user_id: testUser.id,
  client_id: testClient.id,
  name: 'Website Redesign',
  status: 'Active',
  default_po_number: 'PO-2024-001'
};
```

**Document Fixtures**
```typescript
export const testInvoice = {
  id: 1,
  user_id: testUser.id,
  client_id: testClient.id,
  project_id: testProject.id,
  type: 'Invoice',
  status: 'Draft',
  number: 'INV-001',
  po_number: 'PO-2024-001',
  issue_date: '2024-01-15',
  due_date: '2024-02-14',
  subtotal_cents: 100000,
  tax_total_cents: 8000,
  total_cents: 108000,
  balance_due_cents: 108000
};
```

#### Mock Data Generators

Create factory functions for generating test data:

```typescript
export function createMockClient(overrides?: Partial<Client>): Client;
export function createMockProject(overrides?: Partial<Project>): Project;
export function createMockDocument(overrides?: Partial<Document>): Document;
export function createMockPayment(overrides?: Partial<Payment>): Payment;
export function createMockExpense(overrides?: Partial<Expense>): Expense;
```

#### Database Seeding for Tests

Create seed scripts for test database:
- Seed users
- Seed clients (10-20 per user)
- Seed projects (5-10 per client)
- Seed documents (20-30 per user)
- Seed payments (10-15 per user)
- Seed expenses (30-50 per user)

### Test Coverage Requirements

- **Overall Coverage**: 80%+ for all code
- **Service Layer**: 90%+ coverage
- **Route Handlers**: 85%+ coverage
- **Utility Functions**: 95%+ coverage
- **Critical Paths**: 100% coverage
  - Authentication
  - Authorization
  - Payment processing
  - Document finalization

### Test Organization

```
backend/tests/
├── unit/
│   ├── services/
│   │   ├── client.service.test.ts
│   │   ├── project.service.test.ts
│   │   ├── document.service.test.ts
│   │   ├── payment.service.test.ts
│   │   └── expense.service.test.ts
│   ├── utils/
│   │   ├── currency.test.ts
│   │   ├── validation.test.ts
│   │   └── formatting.test.ts
│   └── schemas/
│       ├── client.schema.test.ts
│       ├── project.schema.test.ts
│       └── document.schema.test.ts
├── integration/
│   ├── auth/
│   │   ├── register.test.ts
│   │   ├── login.test.ts
│   │   └── refresh.test.ts
│   ├── clients/
│   │   ├── create.test.ts
│   │   ├── list.test.ts
│   │   ├── get.test.ts
│   │   ├── update.test.ts
│   │   └── delete.test.ts
│   ├── projects/
│   ├── documents/
│   ├── payments/
│   └── expenses/
├── fixtures/
│   ├── users.ts
│   ├── clients.ts
│   ├── projects.ts
│   ├── documents.ts
│   ├── payments.ts
│   └── expenses.ts
├── mocks/
│   ├── supabase.ts
│   ├── email.ts
│   └── storage.ts
├── utils/
│   ├── test-server.ts
│   ├── test-db.ts
│   └── factories.ts
└── setup.ts
```

### Test Naming Convention

Use descriptive test names following this pattern:
```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test implementation
    });
    
    it('should throw [error type] when [invalid condition]', () => {
      // Test implementation
    });
  });
});
```

Examples:
- `should create a new client when valid data is provided`
- `should throw ValidationError when email is invalid`
- `should return 404 when client does not exist`
- `should enforce RLS when user tries to access another user's data`

### Setup and Teardown

Each test file should include:
- `beforeAll()` - Set up test database, server
- `beforeEach()` - Reset database state, clear mocks
- `afterEach()` - Clean up test data
- `afterAll()` - Close connections, tear down server

### Mocking Strategy

- **Supabase Client**: Mock for unit tests, real for integration tests
- **Email Service**: Always mock
- **Storage Service**: Mock for most tests
- **External APIs**: Always mock
- **Database**: Use test database for integration tests

## Deliverables

Create the following test specification files:

1. **test-strategy.md** - Overall testing strategy and approach
2. **unit-tests-specification.md** - Complete unit test specifications
3. **integration-tests-specification.md** - Complete integration test specifications
4. **test-data-specification.md** - Test fixtures and mock data specifications
5. **test-setup-guide.md** - Setup instructions for running tests

Each specification should include:
- Detailed test cases with descriptions
- Expected inputs and outputs
- Edge cases to cover
- Error scenarios to test
- Code examples in TypeScript/Vitest syntax
- Setup and teardown requirements

## Format

All specifications should be in Markdown format with:
- Clear section headers
- Code blocks with syntax highlighting
- Tables for test case matrices
- Examples of test implementation
- Links to related specifications

---

**Version**: 1.0.0  
**Created**: 2024-12-23  
**Purpose**: Generate comprehensive test suites for Booklite API