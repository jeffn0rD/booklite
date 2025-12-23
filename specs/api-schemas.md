# API Request/Response Schemas

This document defines all data schemas used in the Booklite API using JSON Schema format.

## Table of Contents

1. [Common Schemas](#common-schemas)
2. [Authentication Schemas](#authentication-schemas)
3. [User Profile Schemas](#user-profile-schemas)
4. [Client Schemas](#client-schemas)
5. [Project Schemas](#project-schemas)
6. [Document Schemas](#document-schemas)
7. [Payment Schemas](#payment-schemas)
8. [Expense Schemas](#expense-schemas)
9. [Category Schemas](#category-schemas)
10. [Tax Rate Schemas](#tax-rate-schemas)
11. [Attachment Schemas](#attachment-schemas)
12. [Report Schemas](#report-schemas)

---

## Common Schemas

### Error Response Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["type", "title", "status", "detail", "instance"],
  "properties": {
    "type": {
      "type": "string",
      "format": "uri",
      "description": "URI reference identifying the problem type"
    },
    "title": {
      "type": "string",
      "description": "Short, human-readable summary"
    },
    "status": {
      "type": "integer",
      "description": "HTTP status code"
    },
    "detail": {
      "type": "string",
      "description": "Human-readable explanation"
    },
    "instance": {
      "type": "string",
      "description": "URI reference identifying the specific occurrence"
    },
    "errors": {
      "type": "array",
      "description": "Array of validation errors",
      "items": {
        "type": "object",
        "properties": {
          "field": {"type": "string"},
          "message": {"type": "string"},
          "code": {"type": "string"}
        }
      }
    },
    "meta": {
      "$ref": "#/definitions/Meta"
    }
  }
}
```

### Pagination Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "next_cursor": {
      "type": ["string", "null"],
      "description": "Cursor for next page"
    },
    "prev_cursor": {
      "type": ["string", "null"],
      "description": "Cursor for previous page"
    },
    "has_more": {
      "type": "boolean",
      "description": "Whether more results exist"
    },
    "total": {
      "type": "integer",
      "description": "Total number of items (optional)"
    }
  }
}
```

### Meta Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["timestamp", "request_id"],
  "properties": {
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp"
    },
    "request_id": {
      "type": "string",
      "description": "Unique request identifier"
    }
  }
}
```

---

## Authentication Schemas

### Register Request Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["email", "password"],
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "maxLength": 255,
      "description": "User email address"
    },
    "password": {
      "type": "string",
      "minLength": 12,
      "maxLength": 256,
      "description": "User password (12-256 characters)"
    },
    "business_name": {
      "type": "string",
      "maxLength": 200,
      "description": "Business name (optional)"
    }
  }
}
```

### Login Request Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["email", "password"],
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    },
    "password": {
      "type": "string"
    }
  }
}
```

### Login Response Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["data", "meta"],
  "properties": {
    "data": {
      "type": "object",
      "required": ["access_token", "refresh_token", "token_type", "expires_in", "user"],
      "properties": {
        "access_token": {
          "type": "string",
          "description": "JWT access token"
        },
        "refresh_token": {
          "type": "string",
          "description": "Refresh token"
        },
        "token_type": {
          "type": "string",
          "enum": ["Bearer"]
        },
        "expires_in": {
          "type": "integer",
          "description": "Token expiration in seconds"
        },
        "user": {
          "$ref": "#/definitions/User"
        }
      }
    },
    "meta": {
      "$ref": "#/definitions/Meta"
    }
  }
}
```

---

## User Profile Schemas

### User Profile Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["user_id", "created_at", "updated_at"],
  "properties": {
    "user_id": {
      "type": "string",
      "format": "uuid",
      "description": "User UUID"
    },
    "business_name": {
      "type": ["string", "null"],
      "maxLength": 200
    },
    "legal_name": {
      "type": ["string", "null"],
      "maxLength": 200
    },
    "address_line1": {
      "type": ["string", "null"],
      "maxLength": 200
    },
    "address_line2": {
      "type": ["string", "null"],
      "maxLength": 200
    },
    "city": {
      "type": ["string", "null"],
      "maxLength": 100
    },
    "region": {
      "type": ["string", "null"],
      "maxLength": 100
    },
    "postal_code": {
      "type": ["string", "null"],
      "maxLength": 20
    },
    "country": {
      "type": ["string", "null"],
      "pattern": "^[A-Z]{2}$",
      "description": "ISO 3166-1 alpha-2 country code"
    },
    "tax_id": {
      "type": ["string", "null"],
      "maxLength": 50
    },
    "logo_attachment_id": {
      "type": ["integer", "null"]
    },
    "default_tax_rate_id": {
      "type": ["integer", "null"]
    },
    "default_payment_terms_days": {
      "type": ["integer", "null"],
      "minimum": 0,
      "maximum": 365
    },
    "numbering_quote_prefix": {
      "type": ["string", "null"],
      "maxLength": 10
    },
    "numbering_invoice_prefix": {
      "type": ["string", "null"],
      "maxLength": 10
    },
    "numbering_padding": {
      "type": "integer",
      "minimum": 2,
      "maximum": 10,
      "default": 4
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### Update User Profile Request Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "business_name": {
      "type": ["string", "null"],
      "maxLength": 200
    },
    "legal_name": {
      "type": ["string", "null"],
      "maxLength": 200
    },
    "address_line1": {
      "type": ["string", "null"],
      "maxLength": 200
    },
    "address_line2": {
      "type": ["string", "null"],
      "maxLength": 200
    },
    "city": {
      "type": ["string", "null"],
      "maxLength": 100
    },
    "region": {
      "type": ["string", "null"],
      "maxLength": 100
    },
    "postal_code": {
      "type": ["string", "null"],
      "maxLength": 20
    },
    "country": {
      "type": ["string", "null"],
      "pattern": "^[A-Z]{2}$"
    },
    "tax_id": {
      "type": ["string", "null"],
      "maxLength": 50
    },
    "default_payment_terms_days": {
      "type": ["integer", "null"],
      "minimum": 0,
      "maximum": 365
    },
    "numbering_quote_prefix": {
      "type": ["string", "null"],
      "maxLength": 10
    },
    "numbering_invoice_prefix": {
      "type": ["string", "null"],
      "maxLength": 10
    },
    "numbering_padding": {
      "type": "integer",
      "minimum": 2,
      "maximum": 10
    }
  }
}
```

---

## Client Schemas

### Client Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "user_id", "name", "email", "created_at", "updated_at"],
  "properties": {
    "id": {
      "type": "integer",
      "description": "Client ID"
    },
    "user_id": {
      "type": "string",
      "format": "uuid"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "billing_address": {
      "type": ["object", "null"],
      "properties": {
        "line1": {"type": "string"},
        "line2": {"type": "string"},
        "city": {"type": "string"},
        "region": {"type": "string"},
        "postal_code": {"type": "string"},
        "country": {"type": "string", "pattern": "^[A-Z]{2}$"}
      }
    },
    "tax_vat_id": {
      "type": ["string", "null"],
      "maxLength": 50
    },
    "default_tax_rate_id": {
      "type": ["integer", "null"]
    },
    "default_payment_terms_days": {
      "type": ["integer", "null"],
      "minimum": 0,
      "maximum": 365
    },
    "default_currency": {
      "type": "string",
      "enum": ["USD"],
      "default": "USD"
    },
    "archived_at": {
      "type": ["string", "null"],
      "format": "date-time"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### Create Client Request Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "billing_address": {
      "type": "object",
      "properties": {
        "line1": {"type": "string"},
        "line2": {"type": "string"},
        "city": {"type": "string"},
        "region": {"type": "string"},
        "postal_code": {"type": "string"},
        "country": {"type": "string", "pattern": "^[A-Z]{2}$"}
      }
    },
    "tax_vat_id": {
      "type": "string",
      "maxLength": 50
    },
    "default_tax_rate_id": {
      "type": "integer"
    },
    "default_payment_terms_days": {
      "type": "integer",
      "minimum": 0,
      "maximum": 365
    }
  }
}
```

---

## Document Schemas

### Document Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "user_id", "type", "client_id", "currency", "status", "created_at", "updated_at"],
  "properties": {
    "id": {
      "type": "integer"
    },
    "user_id": {
      "type": "string",
      "format": "uuid"
    },
    "type": {
      "type": "string",
      "enum": ["quote", "invoice"]
    },
    "number": {
      "type": ["string", "null"],
      "description": "Document number (assigned on finalization)"
    },
    "client_id": {
      "type": "integer"
    },
    "project_id": {
      "type": ["integer", "null"]
    },
    "po_number": {
      "type": ["string", "null"],
      "maxLength": 50
    },
    "issue_date": {
      "type": ["string", "null"],
      "format": "date"
    },
    "due_date": {
      "type": ["string", "null"],
      "format": "date",
      "description": "Invoices only"
    },
    "expiry_date": {
      "type": ["string", "null"],
      "format": "date",
      "description": "Quotes only"
    },
    "public_notes": {
      "type": ["string", "null"]
    },
    "internal_notes": {
      "type": ["string", "null"]
    },
    "currency": {
      "type": "string",
      "enum": ["USD"]
    },
    "subtotal_cents": {
      "type": "integer",
      "minimum": 0
    },
    "tax_total_cents": {
      "type": "integer",
      "minimum": 0
    },
    "total_cents": {
      "type": "integer",
      "minimum": 0
    },
    "amount_paid_cents": {
      "type": "integer",
      "minimum": 0
    },
    "balance_due_cents": {
      "type": "integer",
      "minimum": 0
    },
    "status": {
      "type": "string",
      "enum": ["Draft", "Sent", "Unpaid", "Partial", "Paid", "Void", "Accepted", "Expired"]
    },
    "accepted_at": {
      "type": ["string", "null"],
      "format": "date-time"
    },
    "sent_at": {
      "type": ["string", "null"],
      "format": "date-time"
    },
    "finalized_at": {
      "type": ["string", "null"],
      "format": "date-time"
    },
    "archived_at": {
      "type": ["string", "null"],
      "format": "date-time"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### Line Item Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "document_id", "position", "description", "quantity", "unit_price_cents"],
  "properties": {
    "id": {
      "type": "integer"
    },
    "user_id": {
      "type": "string",
      "format": "uuid"
    },
    "document_id": {
      "type": "integer"
    },
    "position": {
      "type": "integer",
      "minimum": 1
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "maxLength": 1000
    },
    "quantity": {
      "type": "number",
      "minimum": 0,
      "multipleOf": 0.0001
    },
    "unit": {
      "type": ["string", "null"],
      "maxLength": 20,
      "description": "e.g., hours, each, day, month"
    },
    "unit_price_cents": {
      "type": "integer",
      "minimum": 0
    },
    "line_subtotal_cents": {
      "type": "integer",
      "minimum": 0,
      "description": "Calculated: quantity * unit_price_cents"
    },
    "tax_rate_percent": {
      "type": ["number", "null"],
      "minimum": 0,
      "maximum": 100
    },
    "tax_amount_cents": {
      "type": "integer",
      "minimum": 0,
      "description": "Calculated: line_subtotal_cents * (tax_rate_percent / 100)"
    },
    "line_total_cents": {
      "type": "integer",
      "minimum": 0,
      "description": "Calculated: line_subtotal_cents + tax_amount_cents"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### Create Document Request Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["type", "client_id"],
  "properties": {
    "type": {
      "type": "string",
      "enum": ["quote", "invoice"]
    },
    "client_id": {
      "type": "integer"
    },
    "project_id": {
      "type": "integer"
    },
    "po_number": {
      "type": "string",
      "maxLength": 50
    },
    "issue_date": {
      "type": "string",
      "format": "date"
    },
    "due_date": {
      "type": "string",
      "format": "date"
    },
    "expiry_date": {
      "type": "string",
      "format": "date"
    },
    "public_notes": {
      "type": "string"
    },
    "internal_notes": {
      "type": "string"
    },
    "line_items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["position", "description", "quantity", "unit_price_cents"],
        "properties": {
          "position": {
            "type": "integer",
            "minimum": 1
          },
          "description": {
            "type": "string",
            "minLength": 1,
            "maxLength": 1000
          },
          "quantity": {
            "type": "number",
            "minimum": 0
          },
          "unit": {
            "type": "string",
            "maxLength": 20
          },
          "unit_price_cents": {
            "type": "integer",
            "minimum": 0
          },
          "tax_rate_percent": {
            "type": "number",
            "minimum": 0,
            "maximum": 100
          }
        }
      }
    }
  }
}
```

---

## Payment Schemas

### Payment Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "user_id", "invoice_id", "date", "amount_cents", "created_at"],
  "properties": {
    "id": {
      "type": "integer"
    },
    "user_id": {
      "type": "string",
      "format": "uuid"
    },
    "invoice_id": {
      "type": "integer"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "amount_cents": {
      "type": "integer",
      "minimum": 1
    },
    "method": {
      "type": ["string", "null"],
      "maxLength": 50,
      "description": "e.g., Bank Transfer, Credit Card, Cash, Check"
    },
    "reference": {
      "type": ["string", "null"],
      "maxLength": 100,
      "description": "Transaction reference or check number"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### Create Payment Request Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["invoice_id", "date", "amount_cents"],
  "properties": {
    "invoice_id": {
      "type": "integer"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "amount_cents": {
      "type": "integer",
      "minimum": 1
    },
    "method": {
      "type": "string",
      "maxLength": 50
    },
    "reference": {
      "type": "string",
      "maxLength": 100
    }
  }
}
```

---

## Expense Schemas

### Expense Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "user_id", "date", "total_amount_cents", "tax_amount_cents", "currency", "billable", "billing_status", "created_at", "updated_at"],
  "properties": {
    "id": {
      "type": "integer"
    },
    "user_id": {
      "type": "string",
      "format": "uuid"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "vendor": {
      "type": ["string", "null"],
      "maxLength": 200
    },
    "category_id": {
      "type": ["integer", "null"]
    },
    "project_id": {
      "type": ["integer", "null"]
    },
    "total_amount_cents": {
      "type": "integer",
      "minimum": 0
    },
    "tax_amount_cents": {
      "type": "integer",
      "minimum": 0
    },
    "currency": {
      "type": "string",
      "enum": ["USD"]
    },
    "receipt_attachment_id": {
      "type": ["integer", "null"]
    },
    "notes": {
      "type": ["string", "null"]
    },
    "billable": {
      "type": "boolean",
      "default": false
    },
    "billing_status": {
      "type": "string",
      "enum": ["unbilled", "billed", "user_paid"],
      "default": "unbilled"
    },
    "linked_invoice_id": {
      "type": ["integer", "null"]
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

---

## Additional Schemas

For brevity, additional schemas follow similar patterns:

- **Project Schema**: Similar to Client with status enum
- **Category Schema**: Simple name/description
- **Tax Rate Schema**: Name, rate_percent, is_default
- **Attachment Schema**: Bucket, path, mime_type, size_bytes
- **Note Schema**: Entity type, entity_id, body
- **Email Log Schema**: Document_id, to_email, subject, body, status
- **Official Copy Schema**: Document_id, pdf_attachment_id, email_body

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Draft for Implementation