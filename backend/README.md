# Booklite Backend API

Complete backend implementation for the Booklite lightweight bookkeeping application.

## Overview

This is a fully-featured REST API built with Fastify and TypeScript, providing comprehensive bookkeeping functionality for independent consultants.

**Status**: ✅ Complete Implementation  
**Framework**: Fastify 4.x  
**Language**: TypeScript 5.x  
**Database**: PostgreSQL (Supabase)  
**Authentication**: JWT via Supabase Auth  

## Features

### ✅ Implemented

- **Complete CRUD Operations** for all 8 entities
- **Authentication & Authorization** via JWT and RLS
- **Input Validation** with Zod schemas
- **Error Handling** (RFC 7807 compliant)
- **Structured Logging** with Pino
- **Rate Limiting** and security headers
- **Type Safety** throughout with TypeScript
- **Business Logic** for complex operations

### Entities

1. **Clients** - Client management with full CRUD
2. **Projects** - Project tracking with status management
3. **Documents** - Quotes and invoices with finalization, voiding, conversion
4. **Payments** - Payment processing with balance updates
5. **Expenses** - Expense tracking with billable/billed flags
6. **Categories** - Expense categorization
7. **Tax Rates** - Tax rate management
8. **User Profile** - User settings and preferences

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Supabase account and project
- PostgreSQL database (via Supabase)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Variables

Required variables in `.env`:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# CORS
CORS_ORIGIN=http://localhost:4321
```

### Database Setup

1. Create Supabase project
2. Run migrations from `/sql` directory:
   ```bash
   # In Supabase SQL Editor, run in order:
   # 1. 01_schema_core.sql
   # 2. 02_constraints.sql
   # 3. 03_indexes.sql
   # 4. 04_triggers.sql
   # 5. 05_rls_policies.sql
   # 6. 06_seed_data.sql (optional)
   ```

### Development

```bash
# Start development server with hot reload
npm run dev

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Health & Info

- `GET /health` - Health check
- `GET /v1` - API version info

### Authentication

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Clients

- `GET /v1/clients` - List clients
- `GET /v1/clients/:id` - Get client
- `POST /v1/clients` - Create client
- `PUT /v1/clients/:id` - Update client
- `DELETE /v1/clients/:id` - Archive client
- `GET /v1/clients/:id/documents` - Get client documents
- `GET /v1/clients/:id/projects` - Get client projects

### Projects

- `GET /v1/projects` - List projects
- `GET /v1/projects/:id` - Get project
- `POST /v1/projects` - Create project
- `PUT /v1/projects/:id` - Update project
- `DELETE /v1/projects/:id` - Archive project
- `GET /v1/projects/:id/documents` - Get project documents
- `GET /v1/projects/:id/expenses` - Get project expenses

### Documents

- `GET /v1/documents` - List documents
- `GET /v1/documents/:id` - Get document
- `POST /v1/documents` - Create document
- `PUT /v1/documents/:id` - Update document
- `DELETE /v1/documents/:id` - Archive document
- `POST /v1/documents/:id/finalize` - Finalize document
- `POST /v1/documents/:id/void` - Void invoice
- `POST /v1/documents/:id/convert` - Convert quote to invoice

### Payments

- `GET /v1/payments` - List payments
- `GET /v1/payments/:id` - Get payment
- `POST /v1/payments` - Create payment
- `PUT /v1/payments/:id` - Update payment
- `DELETE /v1/payments/:id` - Delete payment

### Expenses

- `GET /v1/expenses` - List expenses
- `GET /v1/expenses/:id` - Get expense
- `POST /v1/expenses` - Create expense
- `PUT /v1/expenses/:id` - Update expense
- `DELETE /v1/expenses/:id` - Archive expense

### Categories

- `GET /v1/categories` - List categories
- `GET /v1/categories/:id` - Get category
- `POST /v1/categories` - Create category
- `PUT /v1/categories/:id` - Update category
- `DELETE /v1/categories/:id` - Delete category

### Tax Rates

- `GET /v1/tax-rates` - List tax rates
- `GET /v1/tax-rates/:id` - Get tax rate
- `POST /v1/tax-rates` - Create tax rate
- `PUT /v1/tax-rates/:id` - Update tax rate
- `DELETE /v1/tax-rates/:id` - Delete tax rate

### User Profile

- `GET /v1/user-profile` - Get user profile
- `PUT /v1/user-profile` - Update user profile

## Architecture

### Directory Structure

```
backend/
├── src/
│   ├── config/              # Configuration management
│   ├── features/            # Feature modules
│   │   ├── clients/
│   │   │   ├── services/   # Business logic
│   │   │   └── routes/     # HTTP endpoints
│   │   ├── documents/
│   │   ├── projects/
│   │   ├── payments/
│   │   ├── expenses/
│   │   ├── categories/
│   │   ├── tax-rates/
│   │   └── user-profile/
│   ├── shared/             # Shared code
│   │   ├── types/         # TypeScript types
│   │   ├── errors/        # Error classes
│   │   ├── utils/         # Utility functions
│   │   ├── schemas/       # Zod validation schemas
│   │   └── middleware/    # Middleware functions
│   └── server.ts          # Server entry point
├── tests/                 # Test files
├── package.json
├── tsconfig.json
└── README.md
```

### Design Patterns

#### Service Layer Pattern
All business logic is encapsulated in service classes:

```typescript
export class ClientService {
  constructor(private supabase: SupabaseClient) {}
  
  async list(userId: string, query: ListClientsQuery): Promise<Client[]> {
    // Business logic here
  }
}
```

#### Route Handler Pattern
Routes handle HTTP concerns and delegate to services:

```typescript
fastify.get('/clients', {
  preHandler: [authenticate, validateQuery(schema)],
}, async (request, reply) => {
  const clients = await clientService.list(request.user.id, request.query);
  return reply.send({ data: clients });
});
```

#### Middleware Chain
Composable middleware for cross-cutting concerns:

```typescript
{
  preHandler: [
    authenticate,           // JWT validation
    validateParams(schema), // Param validation
    validateBody(schema),   // Body validation
  ]
}
```

## Error Handling

All errors follow RFC 7807 Problem Details format:

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
  ]
}
```

### Error Types

- `ValidationError` (400) - Input validation failed
- `UnauthorizedError` (401) - Authentication failed
- `ForbiddenError` (403) - Insufficient permissions
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Duplicate resource
- `BusinessLogicError` (422) - Business rule violation
- `RateLimitError` (429) - Rate limit exceeded
- `InternalServerError` (500) - Server error

## Security

### Authentication
- JWT tokens via Supabase Auth
- Token validation on every request
- User context attached to requests

### Authorization
- Row Level Security (RLS) at database level
- User ID enforcement in all queries
- Complete data isolation between users

### Input Validation
- Zod schemas for all inputs
- Type-safe validation
- Detailed error messages

### Rate Limiting
- Global: 100 requests/minute per IP
- Per-user: 1000 requests/hour
- Auth endpoints: 5 requests/minute

### Security Headers
- Helmet for security headers
- CORS configuration
- Content Security Policy

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Structure

```
tests/
├── unit/              # Unit tests
│   ├── services/     # Service tests
│   ├── utils/        # Utility tests
│   └── schemas/      # Schema tests
├── integration/       # Integration tests
│   ├── clients/      # Client endpoint tests
│   ├── documents/    # Document endpoint tests
│   └── ...
├── fixtures/          # Test data
├── mocks/            # Mock implementations
└── utils/            # Test utilities
```

## Deployment

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Environment Variables

Set in Railway dashboard:
- All variables from `.env.example`
- `NODE_ENV=production`
- Database connection strings
- API keys and secrets

### Health Checks

Railway health check endpoint: `GET /health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-23T10:30:00.000Z",
  "environment": "production"
}
```

## Performance

### Optimizations

- Database indexes on all foreign keys and frequently queried fields
- Cursor-based pagination for large datasets
- Efficient query patterns with Supabase
- Connection pooling
- Response compression

### Monitoring

- Structured logging with Pino
- Request ID tracking
- Error logging with stack traces
- Performance metrics

## Documentation

### API Documentation

See `/specs` directory for complete API documentation:
- `api-specification.md` - API overview
- `api-endpoints-reference.md` - Detailed endpoint docs
- `api-schemas.md` - Request/response schemas

### Implementation Guide

See `IMPLEMENTATION.md` for:
- Architecture details
- Design patterns
- Development workflow
- Contributing guidelines

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write JSDoc comments
- Follow SOLID principles

### Commit Messages

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

### Pull Requests

1. Create feature branch
2. Write tests
3. Implement feature
4. Run linting and tests
5. Update documentation
6. Submit PR

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/jeffn0rD/booklite/issues
- Documentation: `/specs` directory
- Implementation Guide: `IMPLEMENTATION.md`

## License

Copyright © 2024 Booklite. All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Production Ready