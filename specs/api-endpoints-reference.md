# API Endpoints Reference

This document provides detailed specifications for all Booklite API endpoints, including request/response schemas, validation rules, and examples.

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Profile Endpoints](#user-profile-endpoints)
3. [Client Endpoints](#client-endpoints)
4. [Project Endpoints](#project-endpoints)
5. [Document Endpoints](#document-endpoints)
6. [Payment Endpoints](#payment-endpoints)
7. [Expense Endpoints](#expense-endpoints)
8. [Category Endpoints](#category-endpoints)
9. [Tax Rate Endpoints](#tax-rate-endpoints)
10. [Attachment Endpoints](#attachment-endpoints)
11. [Report Endpoints](#report-endpoints)
12. [Email Log Endpoints](#email-log-endpoints)
13. [Note Endpoints](#note-endpoints)
14. [Official Copy Endpoints](#official-copy-endpoints)

---

## Authentication Endpoints

### Register User

**Endpoint**: `POST /auth/register`

**Description**: Register a new user account

**Authentication**: None (public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "business_name": "Acme Consulting"
}
```

**Validation Rules**:
- `email`: Required, valid email format, unique
- `password`: Required, 12-256 characters, complexity requirements
- `business_name`: Optional, max 200 characters

**Success Response** (201 Created):
```json
{
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "email_verified": false,
    "created_at": "2024-12-23T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses**:
- `400`: Invalid input (email format, password strength)
- `409`: Email already registered
- `500`: Server error

---

### Login

**Endpoint**: `POST /auth/login`

**Description**: Authenticate user and receive tokens

**Authentication**: None (public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "rt_abc123xyz...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "email_verified": true,
      "mfa_enabled": false
    }
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses**:
- `400`: Invalid input
- `401`: Invalid credentials
- `429`: Too many login attempts
- `500`: Server error

---

### Refresh Token

**Endpoint**: `POST /auth/refresh`

**Description**: Refresh access token using refresh token

**Authentication**: Refresh token in body

**Request Body**:
```json
{
  "refresh_token": "rt_abc123xyz..."
}
```

**Success Response** (200 OK):
```json
{
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "rt_def456uvw...",
    "token_type": "Bearer",
    "expires_in": 900
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses**:
- `401`: Invalid or expired refresh token
- `500`: Server error

---

### Logout

**Endpoint**: `POST /auth/logout`

**Description**: Logout and revoke tokens

**Authentication**: Required (Bearer token)

**Request Body**: None

**Success Response** (204 No Content)

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

## User Profile Endpoints

### Get User Profile

**Endpoint**: `GET /user-profile`

**Description**: Get current user's profile

**Authentication**: Required

**Query Parameters**: None

**Success Response** (200 OK):
```json
{
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "business_name": "Acme Consulting",
    "legal_name": "Acme Consulting LLC",
    "address_line1": "123 Business St",
    "address_line2": "Suite 100",
    "city": "San Francisco",
    "region": "CA",
    "postal_code": "94102",
    "country": "US",
    "tax_id": "12-3456789",
    "logo_attachment_id": 456,
    "default_tax_rate_id": 1,
    "default_payment_terms_days": 30,
    "numbering_quote_prefix": "Q-",
    "numbering_invoice_prefix": "INV-",
    "numbering_padding": 4,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-12-23T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `404`: Profile not found
- `500`: Server error

---

### Update User Profile

**Endpoint**: `PUT /user-profile`

**Description**: Update user profile (full update)

**Authentication**: Required

**Request Body**:
```json
{
  "business_name": "Acme Consulting",
  "legal_name": "Acme Consulting LLC",
  "address_line1": "123 Business St",
  "city": "San Francisco",
  "region": "CA",
  "postal_code": "94102",
  "country": "US",
  "tax_id": "12-3456789",
  "default_payment_terms_days": 30,
  "numbering_quote_prefix": "Q-",
  "numbering_invoice_prefix": "INV-",
  "numbering_padding": 4
}
```

**Validation Rules**:
- `business_name`: Max 200 characters
- `legal_name`: Max 200 characters
- `address_line1`: Max 200 characters
- `city`: Max 100 characters
- `region`: Max 100 characters
- `postal_code`: Max 20 characters
- `country`: ISO 3166-1 alpha-2 code
- `tax_id`: Max 50 characters
- `default_payment_terms_days`: 0-365
- `numbering_quote_prefix`: Max 10 characters
- `numbering_invoice_prefix`: Max 10 characters
- `numbering_padding`: 2-10

**Success Response** (200 OK): Returns updated profile

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

---

## Client Endpoints

### List Clients

**Endpoint**: `GET /clients`

**Description**: List all clients for authenticated user

**Authentication**: Required

**Query Parameters**:
- `limit`: Number of items (default: 20, max: 100)
- `cursor`: Pagination cursor
- `search`: Search by name or email
- `archived`: Filter by archived status (true/false)
- `sort`: Sort field (default: -created_at)

**Example Request**:
```
GET /clients?limit=20&search=acme&archived=false&sort=name
```

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": 123,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corporation",
      "email": "billing@acme.com",
      "billing_address": {
        "line1": "100 Business Park",
        "city": "Manchester",
        "region": "Greater Manchester",
        "postal_code": "M1 1AA",
        "country": "GB"
      },
      "tax_vat_id": "GB987654321",
      "default_tax_rate_id": 1,
      "default_payment_terms_days": 30,
      "default_currency": "USD",
      "archived_at": null,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "next_cursor": "eyJpZCI6MTIzfQ==",
    "prev_cursor": null,
    "has_more": true,
    "total": 45
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

### Get Client

**Endpoint**: `GET /clients/{id}`

**Description**: Get a specific client

**Authentication**: Required

**Path Parameters**:
- `id`: Client ID (integer)

**Query Parameters**:
- `expand`: Include related resources (e.g., `expand=projects,documents`)

**Success Response** (200 OK): Returns client object

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (not owned by user)
- `404`: Client not found
- `500`: Server error

---

### Create Client

**Endpoint**: `POST /clients`

**Description**: Create a new client

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Acme Corporation",
  "email": "billing@acme.com",
  "billing_address": {
    "line1": "100 Business Park",
    "city": "Manchester",
    "region": "Greater Manchester",
    "postal_code": "M1 1AA",
    "country": "GB"
  },
  "tax_vat_id": "GB987654321",
  "default_tax_rate_id": 1,
  "default_payment_terms_days": 30
}
```

**Validation Rules**:
- `name`: Required, 1-200 characters, unique per user
- `email`: Required, valid email format
- `billing_address`: Optional, JSONB object
- `tax_vat_id`: Optional, max 50 characters
- `default_tax_rate_id`: Optional, must exist and belong to user
- `default_payment_terms_days`: Optional, 0-365

**Success Response** (201 Created): Returns created client

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `409`: Client name already exists
- `500`: Server error

---

### Update Client

**Endpoint**: `PUT /clients/{id}`

**Description**: Update client (full update)

**Authentication**: Required

**Path Parameters**:
- `id`: Client ID

**Request Body**: Same as Create Client

**Success Response** (200 OK): Returns updated client

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Client not found
- `409`: Client name conflict
- `500`: Server error

---

### Delete Client

**Endpoint**: `DELETE /clients/{id}`

**Description**: Archive client (soft delete)

**Authentication**: Required

**Path Parameters**:
- `id`: Client ID

**Success Response** (204 No Content)

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Client not found
- `422`: Cannot delete client with active projects
- `500`: Server error

---

## Document Endpoints

### List Documents

**Endpoint**: `GET /documents`

**Description**: List all documents (quotes and invoices)

**Authentication**: Required

**Query Parameters**:
- `limit`: Number of items (default: 20, max: 100)
- `cursor`: Pagination cursor
- `type`: Filter by type (quote/invoice)
- `status`: Filter by status (comma-separated for multiple)
- `client_id`: Filter by client
- `project_id`: Filter by project
- `date_from`: Filter by issue date (YYYY-MM-DD)
- `date_to`: Filter by issue date (YYYY-MM-DD)
- `search`: Search by number or notes
- `archived`: Filter by archived status
- `sort`: Sort field (default: -created_at)

**Example Request**:
```
GET /documents?type=invoice&status=Unpaid,Partial&date_from=2024-01-01&sort=-issue_date
```

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": 42,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "invoice",
      "number": "INV-0042",
      "client_id": 123,
      "project_id": 456,
      "po_number": "PO-2024-001",
      "issue_date": "2024-02-01",
      "due_date": "2024-03-03",
      "expiry_date": null,
      "public_notes": "Payment terms: Net 30 days",
      "internal_notes": "First milestone payment",
      "currency": "USD",
      "subtotal_cents": 2500000,
      "tax_total_cents": 500000,
      "total_cents": 3000000,
      "amount_paid_cents": 1500000,
      "balance_due_cents": 1500000,
      "status": "Partial",
      "accepted_at": null,
      "sent_at": "2024-02-01T09:00:00.000Z",
      "finalized_at": "2024-02-01T09:00:00.000Z",
      "archived_at": null,
      "created_at": "2024-02-01T08:00:00.000Z",
      "updated_at": "2024-02-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "next_cursor": "eyJpZCI6NDJ9",
    "prev_cursor": null,
    "has_more": true,
    "total": 87
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

### Create Document

**Endpoint**: `POST /documents`

**Description**: Create a new document (quote or invoice)

**Authentication**: Required

**Request Body**:
```json
{
  "type": "invoice",
  "client_id": 123,
  "project_id": 456,
  "po_number": "PO-2024-001",
  "issue_date": "2024-02-01",
  "due_date": "2024-03-03",
  "public_notes": "Payment terms: Net 30 days",
  "internal_notes": "First milestone payment",
  "line_items": [
    {
      "position": 1,
      "description": "Website Redesign - Milestone 1",
      "quantity": 1,
      "unit": "milestone",
      "unit_price_cents": 2500000,
      "tax_rate_percent": 20.0
    }
  ]
}
```

**Validation Rules**:
- `type`: Required, enum (quote/invoice)
- `client_id`: Required, must exist and belong to user
- `project_id`: Optional, must exist and belong to user and client
- `po_number`: Optional, max 50 characters (inherited from project if null)
- `issue_date`: Optional (required for finalized/sent)
- `due_date`: Optional (invoices only)
- `expiry_date`: Optional (quotes only)
- `public_notes`: Optional, text
- `internal_notes`: Optional, text
- `line_items`: Optional array of line items

**Success Response** (201 Created): Returns created document with calculated totals

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden (client/project not owned)
- `500`: Server error

---

### Send Document

**Endpoint**: `POST /documents/{id}/send`

**Description**: Send document via email and create official copy

**Authentication**: Required

**Path Parameters**:
- `id`: Document ID

**Request Body**:
```json
{
  "to_email": "billing@acme.com",
  "subject": "Invoice INV-0042",
  "message": "Please find attached invoice for services rendered.",
  "cc_emails": ["manager@acme.com"],
  "attach_receipts": false
}
```

**Validation Rules**:
- `to_email`: Required, valid email format
- `subject`: Optional (auto-generated if not provided)
- `message`: Optional (uses template if not provided)
- `cc_emails`: Optional array of valid emails
- `attach_receipts`: Optional boolean (for invoices with expenses)

**Success Response** (200 OK):
```json
{
  "data": {
    "document_id": 42,
    "email_log_id": 789,
    "official_copy_id": 101,
    "sent_at": "2024-12-23T10:30:00.000Z",
    "status": "Sent"
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses**:
- `400`: Validation error (missing issue_date, no line items)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Document not found
- `422`: Document already sent (use resend endpoint)
- `500`: Server error

---

### Finalize Document

**Endpoint**: `POST /documents/{id}/finalize`

**Description**: Finalize document and generate PDF

**Authentication**: Required (MFA step-up required)

**Path Parameters**:
- `id`: Document ID

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "data": {
    "document_id": 42,
    "number": "INV-0042",
    "official_copy_id": 101,
    "pdf_url": "https://storage.booklite.app/pdfs/550e8400.../INV-0042.pdf",
    "finalized_at": "2024-12-23T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses**:
- `400`: Validation error (missing issue_date, no line items)
- `401`: Unauthorized
- `403`: Forbidden (MFA required)
- `404`: Document not found
- `422`: Document already finalized
- `500`: Server error

---

### Void Invoice

**Endpoint**: `POST /documents/{id}/void`

**Description**: Void an invoice

**Authentication**: Required (MFA step-up required)

**Path Parameters**:
- `id`: Document ID

**Request Body**:
```json
{
  "reason": "Duplicate invoice created in error"
}
```

**Validation Rules**:
- `reason`: Required, text

**Success Response** (200 OK): Returns updated document with status "Void"

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden (MFA required)
- `404`: Document not found
- `422`: Cannot void quote, already voided, or has payments
- `500`: Server error

---

### Convert Quote to Invoice

**Endpoint**: `POST /documents/{id}/convert-to-invoice`

**Description**: Convert a quote to an invoice

**Authentication**: Required

**Path Parameters**:
- `id`: Quote document ID

**Request Body**:
```json
{
  "issue_date": "2024-12-23",
  "due_date": "2025-01-22"
}
```

**Validation Rules**:
- `issue_date`: Required, valid date
- `due_date`: Optional, valid date (calculated from payment terms if not provided)

**Success Response** (201 Created): Returns new invoice document

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Document not found
- `422`: Document is not a quote or already converted
- `500`: Server error

---

### Convert Quote to Project

**Endpoint**: `POST /documents/{id}/convert-to-project`

**Description**: Convert a quote to a project

**Authentication**: Required

**Path Parameters**:
- `id`: Quote document ID

**Request Body**:
```json
{
  "project_name": "Website Redesign 2024",
  "default_po_number": "PO-2024-001",
  "notes": "Project created from accepted quote"
}
```

**Validation Rules**:
- `project_name`: Required, 1-200 characters
- `default_po_number`: Optional, max 50 characters
- `notes`: Optional, text

**Success Response** (201 Created): Returns new project

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Document not found
- `422`: Document is not a quote
- `500`: Server error

---

### Add Expenses to Invoice

**Endpoint**: `POST /documents/{id}/add-expenses`

**Description**: Add unbilled expenses to invoice as line items

**Authentication**: Required

**Path Parameters**:
- `id`: Invoice document ID

**Request Body**:
```json
{
  "expense_ids": [123, 456, 789],
  "attach_receipts": true
}
```

**Validation Rules**:
- `expense_ids`: Required, array of expense IDs
- `attach_receipts`: Optional boolean (attach receipt images to email/PDF)

**Success Response** (200 OK):
```json
{
  "data": {
    "document_id": 42,
    "added_line_items": 3,
    "line_item_ids": [101, 102, 103],
    "updated_total_cents": 3500000
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Document or expenses not found
- `422`: Expenses already billed or not billable
- `500`: Server error

---

## Payment Endpoints

### List Payments

**Endpoint**: `GET /payments`

**Description**: List all payments

**Authentication**: Required

**Query Parameters**:
- `limit`: Number of items (default: 20, max: 100)
- `cursor`: Pagination cursor
- `invoice_id`: Filter by invoice
- `date_from`: Filter by payment date
- `date_to`: Filter by payment date
- `method`: Filter by payment method
- `sort`: Sort field (default: -date)

**Success Response** (200 OK): Returns array of payments

---

### Record Payment

**Endpoint**: `POST /payments`

**Description**: Record a payment against an invoice

**Authentication**: Required

**Request Body**:
```json
{
  "invoice_id": 42,
  "date": "2024-02-15",
  "amount_cents": 1500000,
  "method": "Bank Transfer",
  "reference": "TXN-20240215-001"
}
```

**Validation Rules**:
- `invoice_id`: Required, must be invoice type and belong to user
- `date`: Required, valid date
- `amount_cents`: Required, positive integer
- `method`: Optional, max 50 characters
- `reference`: Optional, max 100 characters

**Success Response** (201 Created): Returns created payment and updated invoice status

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Invoice not found
- `422`: Payment exceeds balance due
- `500`: Server error

---

## Expense Endpoints

### List Expenses

**Endpoint**: `GET /expenses`

**Description**: List all expenses

**Authentication**: Required

**Query Parameters**:
- `limit`: Number of items (default: 20, max: 100)
- `cursor`: Pagination cursor
- `category_id`: Filter by category
- `project_id`: Filter by project
- `billable`: Filter by billable status (true/false)
- `billing_status`: Filter by billing status (unbilled/billed/user_paid)
- `date_from`: Filter by expense date
- `date_to`: Filter by expense date
- `sort`: Sort field (default: -date)

**Success Response** (200 OK): Returns array of expenses

---

### Create Expense

**Endpoint**: `POST /expenses`

**Description**: Create a new expense

**Authentication**: Required

**Request Body**:
```json
{
  "date": "2024-01-15",
  "vendor": "Adobe Creative Cloud",
  "category_id": 1,
  "project_id": 456,
  "total_amount_cents": 5999,
  "tax_amount_cents": 1000,
  "notes": "Monthly subscription for design tools",
  "billable": false,
  "receipt_attachment_id": 789
}
```

**Validation Rules**:
- `date`: Required, valid date
- `vendor`: Optional, max 200 characters
- `category_id`: Optional, must exist and belong to user
- `project_id`: Optional, must exist and belong to user
- `total_amount_cents`: Required, >= 0
- `tax_amount_cents`: Required, >= 0, <= total_amount_cents
- `notes`: Optional, text
- `billable`: Required, boolean (default: false)
- `receipt_attachment_id`: Optional, must exist and belong to user

**Success Response** (201 Created): Returns created expense

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Server error

---

## Category Endpoints

### List Categories

**Endpoint**: `GET /categories`

**Description**: List all expense categories

**Authentication**: Required

**Query Parameters**:
- `sort`: Sort field (default: name)

**Success Response** (200 OK): Returns array of categories

---

### Create Category

**Endpoint**: `POST /categories`

**Description**: Create a new expense category

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Software & Tools",
  "description": "Software licenses and development tools"
}
```

**Validation Rules**:
- `name`: Required, max 100 characters, unique per user
- `description`: Optional, text

**Success Response** (201 Created): Returns created category

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `409`: Category name already exists
- `500`: Server error

---

## Tax Rate Endpoints

### List Tax Rates

**Endpoint**: `GET /tax-rates`

**Description**: List all tax rates

**Authentication**: Required

**Query Parameters**:
- `sort`: Sort field (default: name)

**Success Response** (200 OK): Returns array of tax rates

---

### Create Tax Rate

**Endpoint**: `POST /tax-rates`

**Description**: Create a new tax rate

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Standard VAT",
  "rate_percent": 20.0,
  "is_default": true
}
```

**Validation Rules**:
- `name`: Required, max 50 characters, unique per user
- `rate_percent`: Required, 0-100
- `is_default`: Required, boolean (only one default per user)

**Success Response** (201 Created): Returns created tax rate

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `409`: Tax rate name already exists or multiple defaults
- `500`: Server error

---

## Report Endpoints

### Profit & Loss Report

**Endpoint**: `GET /reports/profit-loss`

**Description**: Generate profit & loss report

**Authentication**: Required

**Query Parameters**:
- `date_from`: Start date (required)
- `date_to`: End date (required)
- `project_id`: Filter by project (optional)
- `format`: Response format (json/csv/pdf, default: json)

**Success Response** (200 OK):
```json
{
  "data": {
    "period": {
      "from": "2024-01-01",
      "to": "2024-12-31"
    },
    "revenue": {
      "total_cents": 15000000,
      "invoices_count": 25,
      "by_client": [
        {
          "client_id": 123,
          "client_name": "Acme Corporation",
          "amount_cents": 5000000
        }
      ]
    },
    "expenses": {
      "total_cents": 3000000,
      "expenses_count": 45,
      "by_category": [
        {
          "category_id": 1,
          "category_name": "Software & Tools",
          "amount_cents": 500000
        }
      ]
    },
    "net_profit_cents": 12000000,
    "profit_margin_percent": 80.0
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses**:
- `400`: Invalid date range
- `401`: Unauthorized
- `500`: Server error

---

### Accounts Receivable Report

**Endpoint**: `GET /reports/accounts-receivable`

**Description**: List unpaid and partially paid invoices

**Authentication**: Required

**Query Parameters**:
- `overdue_only`: Filter to overdue invoices only (boolean)
- `sort`: Sort field (default: due_date)

**Success Response** (200 OK):
```json
{
  "data": {
    "summary": {
      "total_outstanding_cents": 4500000,
      "invoices_count": 8,
      "overdue_count": 3,
      "overdue_amount_cents": 1500000
    },
    "invoices": [
      {
        "id": 42,
        "number": "INV-0042",
        "client_id": 123,
        "client_name": "Acme Corporation",
        "issue_date": "2024-02-01",
        "due_date": "2024-03-03",
        "total_cents": 3000000,
        "amount_paid_cents": 1500000,
        "balance_due_cents": 1500000,
        "days_overdue": 0,
        "status": "Partial"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-12-23T10:30:00.000Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

## Additional Endpoints

For brevity, the following endpoints follow similar patterns:

- **Email Logs**: GET /email-logs, GET /email-logs/{id}
- **Notes**: CRUD operations on /notes
- **Official Copies**: GET /official-copies, GET /official-copies/{id}, GET /official-copies/{id}/pdf
- **Attachments**: POST /attachments/upload, GET /attachments/{id}, GET /attachments/{id}/download, DELETE /attachments/{id}

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Draft for Implementation