# Booklite API Specification

## Overview

The Booklite API is a RESTful JSON API that provides comprehensive access to all bookkeeping functionality for independent consultants. The API follows REST principles, uses standard HTTP methods, and returns JSON responses.

**Version**: 1.0.0  
**Base URL**: `https://api.booklite.app/v1`  
**Protocol**: HTTPS only (TLS 1.2+)  
**Content-Type**: application/json  
**Authentication**: JWT Bearer tokens via Supabase Auth

## API Architecture

### Technology Stack
- **Framework**: Fastify (Node.js/TypeScript)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth (JWT RS256)
- **Storage**: Cloudflare R2
- **Email**: Postmark/AWS SES
- **PDF Generation**: Puppeteer/Headless Chrome

### Design Principles
1. **RESTful**: Resource-oriented URLs, standard HTTP methods
2. **Stateless**: Each request contains all necessary information
3. **Secure by Default**: JWT authentication, RLS enforcement, HTTPS only
4. **Consistent**: Uniform response formats, error handling, naming conventions
5. **Performant**: Cursor-based pagination, field selection, efficient queries
6. **Versioned**: URL path versioning for backward compatibility

### Multi-Tenancy
- All data scoped by `user_id` from JWT
- Row Level Security enforced at database level
- Complete data isolation between users
- No cross-tenant data access

## Authentication

### Authentication Flow

1. **Registration**: `POST /auth/register`
2. **Login**: `POST /auth/login` → Returns access token (15 min) + refresh token (30 days)
3. **Token Usage**: Include in Authorization header: `Authorization: Bearer <access_token>`
4. **Token Refresh**: `POST /auth/refresh` with refresh token
5. **Logout**: `POST /auth/logout` to revoke tokens

### JWT Claims
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "role": "User",
  "email": "user@example.com",
  "email_verified": true,
  "mfa": false,
  "session_id": "sess_abc123",
  "iat": 1703332800,
  "exp": 1703333700
}
```

### Security Headers
```
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
Idempotency-Key: <uuid>
```

### Rate Limiting
- **Global**: 100 requests/minute per IP
- **Per-User**: 1000 requests/hour
- **Auth Endpoints**: 5 requests/minute per IP
- **File Uploads**: 10 requests/minute per user

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703333700
```

## Response Format

### Success Response
```json
{
  "data": {
    "id": 123,
    "name": "Example",
    ...
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

### List Response
```json
{
  "data": [
    {...},
    {...}
  ],
  "pagination": {
    "next_cursor": "eyJpZCI6MTIzfQ==",
    "prev_cursor": "eyJpZCI6MTAwfQ==",
    "has_more": true,
    "total": 150
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

### Error Response (RFC 7807)
```json
{
  "type": "https://api.booklite.app/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Request validation failed",
  "instance": "/v1/clients",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address",
      "code": "INVALID_EMAIL"
    }
  ],
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource, constraint violation |
| 422 | Unprocessable Entity | Business logic validation failure |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary unavailability |

## Pagination

### Cursor-Based Pagination (Recommended)
```
GET /clients?limit=20&cursor=eyJpZCI6MTIzfQ==
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTQzfQ==",
    "prev_cursor": "eyJpZCI6MTAzfQ==",
    "has_more": true,
    "total": 150
  }
}
```

### Parameters
- `limit`: Number of items (default: 20, max: 100)
- `cursor`: Opaque cursor for next/previous page

## Filtering

### Query Parameters
```
GET /documents?status=Unpaid&client_id=123&date_from=2024-01-01&date_to=2024-12-31
```

### Common Filters
- **Equality**: `?status=Unpaid`
- **Multiple Values**: `?status=Unpaid,Partial` (OR logic)
- **Range**: `?date_from=2024-01-01&date_to=2024-12-31`
- **Search**: `?search=acme` (full-text search)
- **Boolean**: `?billable=true`
- **Null Checks**: `?project_id=null` or `?project_id=!null`

## Sorting

### Query Parameters
```
GET /documents?sort=-created_at,client_name
```

### Format
- Ascending: `?sort=field_name`
- Descending: `?sort=-field_name`
- Multiple: `?sort=field1,-field2`

### Default Sorting
Most endpoints default to `created_at DESC` (most recent first)

## Field Selection

### Sparse Fieldsets
```
GET /clients?fields=id,name,email
```

Returns only specified fields, reducing payload size.

## Resource Expansion

### Include Related Resources
```
GET /documents?expand=client,project,line_items
```

Includes related resources in response to reduce round trips.

## Idempotency

### Idempotency Key
```
POST /clients
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

- Required for POST, PUT, PATCH operations
- Prevents duplicate operations
- Key valid for 24 hours
- Same key returns cached response

## CORS

### Allowed Origins
- Production: `https://app.booklite.app`
- Development: `http://localhost:*`

### Headers
```
Access-Control-Allow-Origin: https://app.booklite.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-CSRF-Token, Idempotency-Key
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

## Versioning

### URL Path Versioning
- Current: `/v1/`
- Future: `/v2/`

### Deprecation Policy
- 6-month notice for breaking changes
- Deprecated endpoints return `Sunset` header
- Migration guide provided

## Common Data Types

### Monetary Values
- **Format**: Integer (cents)
- **Example**: `1000` = $10.00
- **Currency**: USD only (v1)

### Dates
- **Format**: ISO 8601 date (YYYY-MM-DD)
- **Example**: `2024-12-23`

### Timestamps
- **Format**: ISO 8601 datetime (UTC)
- **Example**: `2024-12-23T10:30:00.000Z`

### UUIDs
- **Format**: RFC 4122 UUID v4
- **Example**: `550e8400-e29b-41d4-a716-446655440000`

### Status Enums

**Document Status (Invoice)**:
- `Draft` - Not yet sent
- `Sent` - Sent to client
- `Unpaid` - Sent but no payments
- `Partial` - Partially paid
- `Paid` - Fully paid
- `Void` - Voided/cancelled

**Document Status (Quote)**:
- `Draft` - Not yet sent
- `Sent` - Sent to client
- `Accepted` - Client accepted
- `Expired` - Past expiry date

**Project Status**:
- `Active` - Currently active
- `Completed` - Finished
- `Archived` - Archived

**Expense Billing Status**:
- `unbilled` - Not yet billed
- `billed` - Added to invoice
- `user_paid` - Paid by user

**Email Status**:
- `queued` - Queued for sending
- `sent` - Successfully sent
- `failed` - Failed to send

## API Endpoints Overview

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/verify-email` - Verify email
- `GET /auth/sessions` - List active sessions
- `DELETE /auth/sessions/{id}` - Revoke session

### User Profile
- `GET /user-profile` - Get user profile
- `PUT /user-profile` - Update user profile
- `POST /user-profile/logo` - Upload logo
- `DELETE /user-profile/logo` - Delete logo

### Clients
- `GET /clients` - List clients
- `GET /clients/{id}` - Get client
- `POST /clients` - Create client
- `PUT /clients/{id}` - Update client
- `PATCH /clients/{id}` - Partial update client
- `DELETE /clients/{id}` - Archive client
- `GET /clients/{id}/projects` - List client projects
- `GET /clients/{id}/documents` - List client documents
- `GET /clients/{id}/notes` - List client notes
- `POST /clients/{id}/notes` - Add client note

### Projects
- `GET /projects` - List projects
- `GET /projects/{id}` - Get project
- `POST /projects` - Create project
- `PUT /projects/{id}` - Update project
- `PATCH /projects/{id}` - Partial update project
- `DELETE /projects/{id}` - Archive project
- `GET /projects/{id}/documents` - List project documents
- `GET /projects/{id}/expenses` - List project expenses
- `GET /projects/{id}/profitability` - Get project profitability

### Documents (Quotes & Invoices)
- `GET /documents` - List documents
- `GET /documents/{id}` - Get document
- `POST /documents` - Create document
- `PUT /documents/{id}` - Update document
- `PATCH /documents/{id}` - Partial update document
- `DELETE /documents/{id}` - Archive document
- `POST /documents/{id}/send` - Send document via email
- `POST /documents/{id}/finalize` - Finalize document
- `POST /documents/{id}/void` - Void invoice
- `POST /documents/{id}/convert-to-project` - Convert quote to project
- `POST /documents/{id}/convert-to-invoice` - Convert quote to invoice
- `POST /documents/{id}/add-expenses` - Add expenses to invoice
- `GET /documents/{id}/pdf` - Download PDF
- `GET /documents/{id}/line-items` - List line items
- `POST /documents/{id}/line-items` - Add line item
- `PUT /documents/{id}/line-items/{line_id}` - Update line item
- `DELETE /documents/{id}/line-items/{line_id}` - Delete line item
- `GET /documents/{id}/payments` - List payments
- `POST /documents/{id}/payments` - Record payment

### Payments
- `GET /payments` - List payments
- `GET /payments/{id}` - Get payment
- `POST /payments` - Record payment
- `PUT /payments/{id}` - Update payment
- `DELETE /payments/{id}` - Delete payment

### Expenses
- `GET /expenses` - List expenses
- `GET /expenses/{id}` - Get expense
- `POST /expenses` - Create expense
- `PUT /expenses/{id}` - Update expense
- `PATCH /expenses/{id}` - Partial update expense
- `DELETE /expenses/{id}` - Delete expense
- `POST /expenses/{id}/receipt` - Upload receipt
- `GET /expenses/{id}/receipt` - Download receipt

### Categories
- `GET /categories` - List categories
- `GET /categories/{id}` - Get category
- `POST /categories` - Create category
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Tax Rates
- `GET /tax-rates` - List tax rates
- `GET /tax-rates/{id}` - Get tax rate
- `POST /tax-rates` - Create tax rate
- `PUT /tax-rates/{id}` - Update tax rate
- `DELETE /tax-rates/{id}` - Delete tax rate
- `POST /tax-rates/{id}/set-default` - Set as default

### Attachments
- `POST /attachments/upload` - Upload file
- `GET /attachments/{id}` - Get attachment metadata
- `GET /attachments/{id}/download` - Download file
- `DELETE /attachments/{id}` - Delete attachment

### Reports
- `GET /reports/profit-loss` - Profit & Loss report
- `GET /reports/project-profitability` - Project profitability
- `GET /reports/balance-sheet` - Balance sheet
- `GET /reports/accounts-receivable` - Accounts receivable
- `POST /reports/export` - Export report

### Email Logs
- `GET /email-logs` - List email logs
- `GET /email-logs/{id}` - Get email log

### Notes
- `GET /notes` - List notes
- `GET /notes/{id}` - Get note
- `POST /notes` - Create note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note

### Official Copies
- `GET /official-copies` - List official copies
- `GET /official-copies/{id}` - Get official copy
- `GET /official-copies/{id}/pdf` - Download PDF

### System
- `GET /health` - Health check
- `GET /version` - API version

## Next Steps

For detailed endpoint specifications, request/response schemas, and examples, see:
- [API Endpoints Reference](./api-endpoints-reference.md)
- [API Request/Response Schemas](./api-schemas.md)
- [API Authentication Guide](./api-authentication-guide.md)
- [API Error Handling Guide](./api-error-handling-guide.md)

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Draft for Implementation