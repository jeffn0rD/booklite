Create an API specification for this application:

## Functional Spec

**Project**: Lightweight bookkeeping for independent consultants (<50 clients)

**Philosophy**: Minimal UI, high efficiency, shared components, template-driven outputs; single-user (no teams), USD-only initially.

**Architecture**:
- Frontend: Astro/Svelte static on Cloudflare Pages
- Backend: Fastify on Railway (application logic, PDF/email generation)
- Database: Supabase/PostgreSQL with RLS; tenancy scoped by user_id
- Storage: Cloudflare R2 (receipts, PDFs, logos)

**Core Modules (7)**:

1. **Dashboard**: AR snapshot, recent activity, net profit (USD), quick links
2. **Transaction Hub**: Unified quotes/invoices/payments list with filters; statuses (Quote: Draft/Sent/Accepted/Expired; Invoice: Draft/Sent/Unpaid/Partial/Paid/Void); line items editor; client/project association; smart PO inheritance; payment tracking; quote→project/invoice conversions; email sending; PDF generation; official copies
3. **Expense Manager**: Quick add; categories; project linking; receipt upload; billing controls (billable, billing_status: unbilled/billed/user_paid, linked_invoice_id); "Add to Invoice" workflow
4. **Client Directory**: Searchable list; detail modal; inline creation; client-level defaults (email, billing address, tax/VAT ID, default tax rate, payment terms)
5. **Project Management**: Projects under clients; status (Active/Completed/Archived); default PO; internal notes; revenue/cost dashboard
6. **Reporting Center**: P&L, Project Profitability, Balance Sheet (lightweight), AR reports; filters (date range, project, client); exports (CSV, PDF, JSON)
7. **Settings**: User profile (issuer defaults: name/business, address, tax ID, logo, default tax rate, payment terms, numbering config); email templates; archive/export/import

**Key Workflows**:
- Invoice with Project & PO (PO inheritance from project)
- Quote → Project conversion
- Partial Payments tracking
- Project Expense tracking with billable flags
- Add Expenses to Invoice workflow
- Official copies on Send/Finalize with change warnings
- Archive/Export/Import with soft-delete support

## Data Model

**Tenancy**: All rows have user_id (FK → auth.users.id); RLS enforced

**Core Entities (14 tables)**:

1. **user_profiles** (1:1 with auth.users): business_name, legal_name, address, tax_id, logo_attachment_id, default_tax_rate_id, default_payment_terms_days, numbering_quote_prefix, numbering_invoice_prefix, numbering_padding
2. **clients**: name, email, billing_address (jsonb), tax_vat_id, default_tax_rate_id, default_payment_terms_days, default_currency='USD', archived_at
3. **projects**: client_id, name, status (Active/Completed/Archived), default_po_number, notes, origin_quote_id, archived_at
4. **documents**: type (quote/invoice), number (unique per user/type), client_id, project_id, po_number, issue_date, due_date, expiry_date, public_notes, internal_notes, currency='USD', subtotal_cents, tax_total_cents, total_cents, amount_paid_cents, balance_due_cents, status, accepted_at, sent_at, finalized_at, archived_at
5. **document_line_items**: document_id, position, description, quantity, unit, unit_price_cents, line_subtotal_cents, tax_rate_percent, tax_amount_cents, line_total_cents
6. **payments**: invoice_id, date, amount_cents, method, reference
7. **expenses**: date, vendor, category_id, project_id, total_amount_cents, tax_amount_cents, currency='USD', receipt_attachment_id, notes, billable, billing_status (unbilled/billed/user_paid), linked_invoice_id
8. **categories**: name, description
9. **attachments**: bucket, path, mime_type, size_bytes, sha256
10. **email_logs**: document_id, to_email, subject, body, status (queued/sent/failed), provider_message_id, sent_at
11. **number_sequences**: type (quote/invoice), prefix, current_value, padding
12. **notes**: entity (client/project), entity_id, body
13. **tax_rates**: name, rate_percent, is_default
14. **official_copies**: document_id, pdf_attachment_id, email_body

**Monetary Values**: All amounts in integer cents (USD) to avoid floating-point issues

**Status Logic**:
- Invoice: sum(payments)=0 → Unpaid; 0<sum<total → Partial; sum≥total → Paid
- Quote: past expiry_date and not accepted → Expired
- Materialized fields: subtotal, tax_total, total, amount_paid, balance_due (updated by triggers)

## Security Spec

**Authentication**:
- Provider: Supabase Auth (JWT RS256)
- Methods: Email/password (primary), Magic link (optional), TOTP MFA (User optional, Admin required)
- Access Token: 15-minute lifetime, claims: sub (user_id), role (User|Admin), iat, exp, session_id, email_verified, mfa
- Refresh Token: 30-day sliding, rotating opaque token, one per device/session
- Session Storage: Web (httpOnly cookie for refresh, memory for access); Native (keychain/secure enclave)
- CSRF Protection: Double-submit or SameSite=Lax + CSRF header for state-changing endpoints
- Logout: POST /auth/logout revokes refresh token, clears cookie, invalidates session_id

**Password Policy**:
- Length: 12-256 characters
- Complexity: 3 of 4 character classes OR zxcvbn strength ≥3
- Disallow: Top 10k breached passwords, email/business name patterns, leading/trailing whitespace
- Hashing: Argon2id (memory_cost ≥64MB, time_cost ≥3, parallelism 1-2, 16-byte salt)
- Rate Limits: 5 login attempts/min per IP; exponential backoff after 10 failures (15-min lock)
- CAPTCHA: After 5 failed attempts/session

**Authorization**:
- Roles: User (RLS-scoped to user_id), Admin (bypasses RLS, audited)
- RLS Policies: All tables enforce user_id = auth.uid() for SELECT/INSERT/UPDATE/DELETE
- Principle of least privilege; no team/multi-user in v1

**Token Validation**:
- All API endpoints verify JWT signature and expiration
- Extract user_id from JWT sub claim
- Validate role claim for admin endpoints
- Check email_verified for sensitive operations
- Step-up MFA for finalize/void/official copy creation if mfa=false or session >12h idle

**Rate Limiting**:
- Global: 100 req/min per IP
- Per-user: 1000 req/hour
- Auth endpoints: 5 req/min per IP
- File uploads: 10 req/min per user

**CORS**:
- Allowed Origins: Cloudflare Pages domain (production), localhost:* (development)
- Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed Headers: Authorization, Content-Type, X-CSRF-Token
- Credentials: true (for cookies)

## API Architecture

**Style**: RESTful JSON API

**Base URL**: `https://api.booklite.app/v1` (production), `http://localhost:3000/v1` (development)

**Framework**: Fastify (Node.js/TypeScript)

**Transport**: HTTPS only (TLS 1.2+)

**Content-Type**: application/json (requests and responses)

**Authentication**: Bearer token in Authorization header: `Authorization: Bearer <access_token>`

**Versioning**: URL path versioning (/v1, /v2, etc.)

**Error Format**: RFC 7807 Problem Details
```json
{
  "type": "https://api.booklite.app/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Invalid email format",
  "instance": "/v1/clients",
  "errors": [
    {"field": "email", "message": "Must be a valid email address"}
  ]
}
```

**Pagination**: Cursor-based for lists
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTIzfQ==",
    "prev_cursor": "eyJpZCI6MTAwfQ==",
    "has_more": true,
    "total": 150
  }
}
```

**Filtering**: Query parameters
- `?status=Unpaid` - Filter by status
- `?client_id=123` - Filter by client
- `?project_id=456` - Filter by project
- `?date_from=2024-01-01&date_to=2024-12-31` - Date range
- `?search=acme` - Text search

**Sorting**: Query parameters
- `?sort=created_at` - Sort ascending
- `?sort=-created_at` - Sort descending (prefix with -)
- `?sort=client_name,-issue_date` - Multiple fields

**Field Selection**: Sparse fieldsets
- `?fields=id,name,email` - Return only specified fields

**Expansion**: Include related resources
- `?expand=client,project` - Include related entities

**Idempotency**: Idempotency-Key header for POST/PUT/PATCH
```
Idempotency-Key: <uuid>
```

**Webhooks**: Event-driven notifications (future)
- Events: document.sent, invoice.paid, expense.created
- Payload: JSON with event type, timestamp, data
- Signature: HMAC-SHA256 for verification

## Requirements

### 1. Define all CRUD endpoints for each entity

**Resource Naming**: Plural nouns, lowercase, hyphen-separated
- `/user-profile` (singular, 1:1 with user)
- `/clients`
- `/projects`
- `/documents` (quotes and invoices)
- `/documents/{id}/line-items`
- `/payments`
- `/expenses`
- `/categories`
- `/attachments`
- `/email-logs`
- `/number-sequences`
- `/notes`
- `/tax-rates`
- `/official-copies`

**Standard CRUD Operations**:
- `GET /resource` - List (with pagination, filtering, sorting)
- `GET /resource/{id}` - Retrieve single
- `POST /resource` - Create
- `PUT /resource/{id}` - Full update (replace)
- `PATCH /resource/{id}` - Partial update
- `DELETE /resource/{id}` - Delete (soft delete where applicable)

**Nested Resources**:
- `GET /documents/{id}/line-items` - List line items for document
- `POST /documents/{id}/line-items` - Add line item to document
- `GET /documents/{id}/payments` - List payments for invoice
- `POST /documents/{id}/payments` - Record payment for invoice
- `GET /clients/{id}/projects` - List projects for client
- `GET /projects/{id}/expenses` - List expenses for project

**Special Operations**:
- `POST /documents/{id}/send` - Send document via email
- `POST /documents/{id}/finalize` - Finalize and generate PDF
- `POST /documents/{id}/convert-to-project` - Convert quote to project
- `POST /documents/{id}/convert-to-invoice` - Convert quote to invoice
- `POST /documents/{id}/void` - Void invoice
- `POST /documents/{id}/add-expenses` - Add expenses to invoice
- `GET /documents/{id}/pdf` - Download PDF
- `POST /attachments/upload` - Upload file
- `GET /attachments/{id}/download` - Download file
- `POST /user-profile/logo` - Upload logo
- `POST /exports` - Create export job
- `GET /exports/{id}` - Get export status/download

### 2. Include request/response schemas

**Use JSON Schema** for all request and response bodies

**Common Patterns**:
- ID fields: integer (bigint)
- user_id: string (uuid)
- Monetary amounts: integer (cents)
- Dates: string (ISO 8601 date: YYYY-MM-DD)
- Timestamps: string (ISO 8601 datetime: YYYY-MM-DDTHH:mm:ss.sssZ)
- Currency: string (enum: ["USD"])
- Status: string (enum: specific to entity)

**Response Envelope**:
```json
{
  "data": {...},
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**List Response**:
```json
{
  "data": [...],
  "pagination": {...},
  "meta": {...}
}
```

### 3. Add validation rules

**Field Validations**:
- Required fields marked clearly
- String length constraints (min/max)
- Numeric ranges (min/max)
- Email format validation
- URL format validation
- Enum value validation
- Date/timestamp format validation
- Regex patterns where applicable

**Business Logic Validations**:
- Cannot archive unpaid invoices
- Cannot delete client with active projects
- Cannot delete project with linked documents
- Payment amount cannot exceed invoice balance
- Line item quantity must be positive
- Tax rate must be 0-100%
- Document number must be unique per user/type
- Client name must be unique per user

### 4. Specify authentication requirements

**Public Endpoints** (no auth required):
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /health`

**Authenticated Endpoints** (require valid JWT):
- All CRUD operations on user data
- User profile management
- Document operations
- File uploads/downloads

**MFA Step-Up Required**:
- `POST /documents/{id}/finalize`
- `POST /documents/{id}/void`
- `POST /official-copies`
- `DELETE /user-profile`

**Admin Only**:
- `GET /admin/users`
- `POST /admin/users/{id}/impersonate`
- `GET /admin/audit-logs`

### 5. Define error responses (400, 401, 403, 404, 500)

**400 Bad Request**: Invalid input, validation errors
```json
{
  "type": "https://api.booklite.app/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Request validation failed",
  "instance": "/v1/clients",
  "errors": [
    {"field": "email", "message": "Must be a valid email address"},
    {"field": "name", "message": "Required field"}
  ]
}
```

**401 Unauthorized**: Missing or invalid authentication
```json
{
  "type": "https://api.booklite.app/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid or expired access token",
  "instance": "/v1/clients"
}
```

**403 Forbidden**: Insufficient permissions
```json
{
  "type": "https://api.booklite.app/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "You do not have permission to access this resource",
  "instance": "/v1/clients/123"
}
```

**404 Not Found**: Resource not found
```json
{
  "type": "https://api.booklite.app/errors/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "Client with ID 123 not found",
  "instance": "/v1/clients/123"
}
```

**409 Conflict**: Resource conflict (duplicate, constraint violation)
```json
{
  "type": "https://api.booklite.app/errors/conflict",
  "title": "Conflict",
  "status": 409,
  "detail": "Client with name 'Acme Corp' already exists",
  "instance": "/v1/clients"
}
```

**422 Unprocessable Entity**: Business logic validation failure
```json
{
  "type": "https://api.booklite.app/errors/business-rule-violation",
  "title": "Business Rule Violation",
  "status": 422,
  "detail": "Cannot archive unpaid invoice",
  "instance": "/v1/documents/123"
}
```

**429 Too Many Requests**: Rate limit exceeded
```json
{
  "type": "https://api.booklite.app/errors/rate-limit-exceeded",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "Too many requests. Please try again in 60 seconds.",
  "instance": "/v1/clients",
  "retry_after": 60
}
```

**500 Internal Server Error**: Server error
```json
{
  "type": "https://api.booklite.app/errors/internal-error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred. Please try again later.",
  "instance": "/v1/clients",
  "request_id": "req_abc123"
}
```

### 6. Add pagination for list endpoints

**Cursor-Based Pagination** (preferred for performance):
- Request: `GET /clients?limit=20&cursor=eyJpZCI6MTIzfQ==`
- Response includes: next_cursor, prev_cursor, has_more, total (optional)

**Offset-Based Pagination** (alternative):
- Request: `GET /clients?limit=20&offset=40`
- Response includes: offset, limit, total

**Default Limits**:
- Default: 20 items
- Maximum: 100 items
- Configurable per endpoint

### 7. Include filtering and sorting parameters

**Filtering**:
- Equality: `?status=Unpaid`
- Multiple values: `?status=Unpaid,Partial` (OR logic)
- Range: `?date_from=2024-01-01&date_to=2024-12-31`
- Search: `?search=acme` (full-text search)
- Boolean: `?billable=true`
- Null checks: `?project_id=null` or `?project_id=!null`

**Sorting**:
- Single field: `?sort=created_at` (ascending) or `?sort=-created_at` (descending)
- Multiple fields: `?sort=client_name,-issue_date`
- Default sort: Most recent first (created_at DESC)

**Common Filters by Entity**:
- Documents: status, type, client_id, project_id, date_from, date_to, search
- Expenses: category_id, project_id, billable, billing_status, date_from, date_to
- Payments: invoice_id, date_from, date_to, method
- Projects: client_id, status, search
- Clients: search, archived

### 8. Add example requests and responses

**Include for each endpoint**:
- Complete request with headers, query params, body
- Success response (200, 201, 204)
- Error responses (400, 401, 403, 404, 422, 500)
- cURL examples
- TypeScript/JavaScript examples (using fetch)

**Example Format**:
```
Request:
POST /v1/clients
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "name": "Acme Corporation",
  "email": "billing@acme.com",
  "billing_address": {
    "line1": "123 Business St",
    "city": "San Francisco",
    "region": "CA",
    "postal_code": "94102",
    "country": "US"
  }
}

Response (201 Created):
{
  "data": {
    "id": 123,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corporation",
    "email": "billing@acme.com",
    "billing_address": {...},
    "created_at": "2024-12-23T10:30:00.000Z",
    "updated_at": "2024-12-23T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

## Format

**API Specification Format**: OpenAPI 3.1.0 (YAML) with all components defined

**Required Sections**:
1. **Info**: Title, version, description, contact, license
2. **Servers**: Development, staging, production URLs
3. **Security Schemes**: JWT Bearer authentication
4. **Tags**: Organize endpoints by resource/module
5. **Paths**: All endpoints with operations
6. **Components**:
   - Schemas: Request/response models
   - Parameters: Reusable query/path parameters
   - Responses: Reusable response definitions
   - SecuritySchemes: Authentication methods
   - Examples: Request/response examples
7. **Webhooks**: Event definitions (future)

**Additional Documentation**:
- API Overview (markdown)
- Authentication Guide (markdown)
- Rate Limiting Guide (markdown)
- Error Handling Guide (markdown)
- Pagination Guide (markdown)
- Filtering & Sorting Guide (markdown)
- Webhooks Guide (markdown, future)
- Migration Guide (markdown, for version changes)

**Code Generation**:
- TypeScript client SDK
- Request/response type definitions
- API route handlers (Fastify)
- Validation schemas (Zod/Joi)
- Mock server for testing

**Testing**:
- Postman collection
- Integration test suite
- Contract tests (Pact)

Generate comprehensive API specification with all endpoints, schemas, validations, examples, and supporting documentation.