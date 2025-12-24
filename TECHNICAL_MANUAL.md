# BookLite Backend Technical Manual

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Library Documentation](#library-documentation)
4. [Request Handling Flow](#request-handling-flow)
5. [Security Implementation](#security-implementation)
6. [Code Navigation Guide](#code-navigation-guide)
7. [Design Decisions & Paradigms](#design-decisions--paradigms)
8. [Testing Guide](#testing-guide)
9. [Glossary](#glossary)
10. [Further Reading & References](#further-reading--references)

---

## Executive Summary

BookLite is a lightweight, RESTful backend API designed specifically for independent consultants and small businesses requiring streamlined bookkeeping functionality. Built on Node.js with Fastify and TypeScript, the system provides a secure, scalable, and performant solution for managing clients, projects, expenses, payments, documents, and tax-related data. The architecture emphasizes security through Supabase's Row Level Security (RLS), multi-tenant isolation, and comprehensive authentication mechanisms. With a focus on developer experience and maintainability, the system implements modern development practices including comprehensive testing, type safety, and modular design patterns.

The backend serves as the central data management layer for the BookLite ecosystem, handling all CRUD operations, business logic enforcement, data validation, and security checks. It integrates seamlessly with Supabase for database management and authentication, while maintaining flexibility for future extensions and integrations with third-party services like Cloudflare R2 for storage and Postmark for email communications.

---

## System Architecture Overview

### High-Level Architecture

The BookLite backend follows a **layered service architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS/REST API
┌─────────────────────▼───────────────────────────────────────┐
│                 Fastify Server Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Routes    │ │ Middleware  │ │     Validation      │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Service Layer                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Business  │ │    Data     │ │    Integration      │   │
│  │   Logic     │ │ Transform   │ │      Services       │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Data Access Layer                           │
│              Supabase PostgreSQL                            │
│           (Row Level Security)                             │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

1. **Fastify Server**: High-performance web framework handling HTTP requests, routing, and middleware
2. **Service Layer**: Business logic implementation with data transformation and validation
3. **Authentication & Authorization**: JWT-based auth with Supabase integration
4. **Database Layer**: Supabase PostgreSQL with RLS for multi-tenancy
5. **Validation Layer**: Zod schemas for request/response validation
6. **Error Handling**: Centralized error management with proper HTTP status codes

### Technology Stack Summary

- **Runtime**: Node.js 20+ with ES modules
- **Framework**: Fastify 4.25+ with TypeScript 5.3+
- **Database**: Supabase PostgreSQL with RLS
- **Authentication**: Supabase Auth (JWT RS256)
- **Validation**: Zod 3.22+ for schema validation
- **Testing**: Vitest with unit and integration test suites
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Pino with structured logging
- **Development**: ESLint, Prettier, TypeScript strict mode

---

## Library Documentation

### Core Framework

#### Fastify (v4.25.2)
**Purpose**: High-performance web framework with low overhead
**Key Features Utilized**:
- Plugin-based architecture for modularity
- Built-in request validation and serialization
- Comprehensive error handling
- Async/await support throughout
- Automatic route registration with prefixes

**Integration Points**:
- Extends via plugins (CORS, Helmet, Rate Limiting)
- Decorates with Supabase client and authentication data
- Integrates with Pino for structured logging
- Serves as foundation for all HTTP operations

**Configuration**:
```typescript
const server = Fastify({
  logger: { level: config.logging.level },
  requestIdHeader: 'x-request-id',
  disableRequestLogging: false,
  trustProxy: true,
});
```

#### Supabase JS Client (v2.39.3)
**Purpose**: TypeScript client for Supabase services
**Key Features Utilized**:
- Direct database access with TypeScript types
- Authentication token verification
- Row Level Security enforcement
- Automatic JWT handling

**Integration Points**:
- Decorates Fastify server instance for global access
- Attached to each request object for tenant isolation
- Used in all service layers for data operations
- Provides type-safe database queries

**Configuration**:
```typescript
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);
```

### Validation & Type Safety

#### Zod (v3.22.4)
**Purpose**: TypeScript-first schema validation
**Key Features Utilized**:
- Runtime type validation for API requests
- Automatic TypeScript type inference
- Comprehensive error messages
- Schema composition and inheritance

**Integration Points**:
- Validates all incoming request bodies and parameters
- Generates TypeScript types from schemas
- Used in route handlers and service layers
- Provides data transformation capabilities

**Example Schema**:
```typescript
const createClientSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});
```

### Security Libraries

#### @fastify/helmet (v11.1.1)
**Purpose**: Security headers middleware
**Key Features Utilized**:
- Content Security Policy (CSP) in production
- X-Frame-Options, X-Content-Type-Options
- HSTS header configuration
- Protection against XSS and clickjacking

**Configuration**:
```typescript
await server.register(helmet, {
  contentSecurityPolicy: config.server.isProduction,
});
```

#### @fastify/cors (v9.0.1)
**Purpose**: Cross-Origin Resource Sharing handling
**Key Features Utilized**:
- Configurable origin policies
- Credentials support for JWT tokens
- Preflight request handling
- Environment-specific configuration

**Configuration**:
```typescript
await server.register(cors, {
  origin: config.cors.origin,
  credentials: config.cors.credentials,
});
```

#### @fastify/rate-limit (v9.1.0)
**Purpose**: Request rate limiting to prevent abuse
**Key Features Utilized**:
- Global rate limits (100 requests/minute)
- Per-user rate limits (1000 requests/minute)
- Authentication endpoint limits (5 requests/minute)
- Redis-compatible storage backend

**Configuration**:
```typescript
await server.register(rateLimit, {
  max: config.rateLimit.global,
  timeWindow: '1 minute',
});
```

### Development & Testing

#### Vitest (v1.1.3)
**Purpose**: Modern testing framework with Vite integration
**Key Features Utilized**:
- Jest-compatible API with faster performance
- Built-in TypeScript support
- Coverage reporting with v8
- Watch mode and UI interface

**Configuration**:
- Unit tests in `tests/unit/`
- Integration tests in `tests/integration/`
- Coverage threshold: 80% minimum

#### TypeScript (v5.3.3)
**Purpose**: Static type checking and enhanced development experience
**Key Features Utilized**:
- Strict type checking mode
- Path mapping for clean imports
- ES modules support with .js extensions
- Declaration file generation

**Key Configuration**:
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  }
}
```

### Logging & Monitoring

#### Pino (v8.17.2)
**Purpose**: High-performance structured logging
**Key Features Utilized**:
- JSON-structured log output
- Request ID tracking across logs
- Configurable log levels
- Pretty printing in development

**Integration**:
```typescript
const server = Fastify({
  logger: {
    level: config.logging.level,
    transport: config.logging.prettyPrint
      ? { target: 'pino-pretty' }
      : undefined,
  },
});
```

---

## Request Handling Flow

### Complete Request Lifecycle

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTTP Request  │───▶│   Fastify Core  │───▶│   Request ID    │
│                 │    │   Reception     │    │   Generation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTTP Response │◀───│   Serialization │◀───│   Middleware    │
│                 │    │                 │    │     Chain       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        ▲
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Client      │◀───│   Error Handler │◀───│   Route Handler │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Detailed Flow Breakdown

#### 1. Request Reception
- **Entry Point**: Fastify server receives HTTP request
- **Request ID**: Unique identifier generated for tracing
- **Logging**: Initial request logged with metadata

#### 2. Middleware Chain Execution

**Order of Operations**:
```typescript
// 1. CORS Headers
await server.register(cors, options);

// 2. Security Headers  
await server.register(helmet, options);

// 3. Rate Limiting
await server.register(rateLimit, options);

// 4. Supabase Client Decoration
server.decorateRequest('supabase', null);

// 5. Authentication Hook
server.addHook('onRequest', async (request) => {
  // JWT validation and user context
});
```

#### 3. Route Resolution
- **Path Matching**: Fastify matches request path to registered routes
- **HTTP Method**: Verbs (GET, POST, PUT, DELETE) determine handler
- **Parameter Extraction**: URL parameters and query strings parsed

**Route Registration Example**:
```typescript
await server.register(clientRoutes, { prefix: '/v1' });
```

#### 4. Authentication & Authorization
```typescript
// Authentication middleware flow
async function authenticate(request: FastifyRequest) {
  const token = extractToken(request.headers.authorization);
  const { data: { user }, error } = await request.supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new UnauthorizedError('Invalid authentication token');
  }
  
  request.user = user;
}
```

#### 5. Request Validation
```typescript
// Zod schema validation in route handler
async function createClientHandler(request: FastifyRequest) {
  const validatedData = createClientSchema.parse(request.body);
  // Proceed with validated data
}
```

#### 6. Business Logic Execution
```typescript
// Service layer interaction
async function createClientHandler(request: FastifyRequest) {
  const validatedData = createClientSchema.parse(request.body);
  const client = await clientService.create(request.user.id, validatedData);
  return client;
}
```

#### 7. Response Serialization
```typescript
// Fastify automatic serialization
const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  // ... other fields
});

// Response automatically validated and serialized
return { data: client, meta: { timestamp: new Date().toISOString() } };
```

### Error Handling Procedures

#### Error Classification System
```typescript
// Custom error hierarchy
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}
```

#### Centralized Error Handler
```typescript
export const errorHandler = (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(error);
  
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
  
  // Default error response
  return reply.status(500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
};
```

---

## Security Implementation

### Authentication Mechanisms

#### JWT Token Flow
```typescript
// 1. User Authentication via Supabase
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// 2. Token Validation in API Requests
async function validateToken(request: FastifyRequest) {
  const authHeader = request.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  const { data: { user }, error } = await request.supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new UnauthorizedError('Invalid or expired token');
  }
  
  return user;
}
```

#### Token Structure and Claims
```json
{
  "aud": "authenticated",
  "exp": 1647427200,
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "authenticated",
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {},
  "iat": 1647423600
}
```

### Authorization Patterns

#### Row Level Security (RLS)
```sql
-- Example RLS Policy for clients table
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);
```

#### Service-Level Authorization
```typescript
// Tenant isolation in service layer
export class ClientService {
  async create(userId: string, data: CreateClientDto): Promise<Client> {
    // RLS automatically enforces userId filter
    const { data: client, error } = await this.supabase
      .from('clients')
      .insert({
        ...data,
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) throw new DatabaseError(error.message);
    return client;
  }
}
```

### Data Encryption Methods

#### Encryption in Transit
- **HTTPS/TLS 1.2+**: All API communications encrypted
- **CORS Configuration**: Strict origin policies
- **Security Headers**: HSTS, CSP, X-Frame-Options

#### Encryption at Rest
- **Supabase Encryption**: Database encryption managed by Supabase
- **Environment Variables**: Sensitive data encrypted in storage
- **API Keys**: Service role keys stored securely

### Security Middleware Stack

#### Helmet Configuration
```typescript
await server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});
```

#### Rate Limiting Strategy
```typescript
// Multi-tier rate limiting
const rateLimitConfig = {
  global: {
    max: 100,
    timeWindow: '1 minute',
    skipOnError: false,
  },
  perUser: {
    max: 1000,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.user?.id || request.ip,
  },
  auth: {
    max: 5,
    timeWindow: '1 minute',
    skipSuccessfulRequests: true,
  },
};
```

### Vulnerability Mitigation

#### Input Validation
```typescript
// Comprehensive validation using Zod
const clientSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .regex(/^[a-zA-Z0-9\s\-.,]+$/, "Invalid characters"),
  email: z.string()
    .email("Invalid email format")
    .optional(),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone format")
    .optional(),
});
```

#### SQL Injection Prevention
- **Parameterized Queries**: All database queries use parameterized statements
- **Supabase Client**: Built-in SQL injection protection
- **RLS Policies**: Database-level access control

#### XSS Prevention
```typescript
// Content Security Policy
await server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
});
```

### Compliance Considerations

#### Data Privacy (GDPR)
```typescript
// Data deletion compliance
export class ClientService {
  async delete(userId: string, clientId: string): Promise<void> {
    // Soft delete for audit trail
    const { error } = await this.supabase
      .from('clients')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .eq('user_id', userId);
      
    if (error) throw new DatabaseError(error.message);
  }
}
```

#### Audit Logging
```typescript
// Request audit trail
server.addHook('onRequest', async (request, reply) => {
  request.log.info({
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
    userId: request.user?.id,
    timestamp: new Date().toISOString(),
  });
});
```

---

## Code Navigation Guide

### Directory Structure

```
booklite/backend/
├── src/
│   ├── config/                 # Configuration management
│   │   └── index.ts           # Central config with Zod validation
│   ├── features/              # Feature-based organization
│   │   ├── clients/
│   │   │   ├── routes/        # HTTP route handlers
│   │   │   │   └── client.routes.ts
│   │   │   ├── services/      # Business logic layer
│   │   │   │   └── client.service.ts
│   │   │   └── schemas/       # Zod validation schemas
│   │   │       ├── client.schema.ts
│   │   │       └── index.ts
│   │   ├── documents/         # Same pattern for all features
│   │   ├── projects/
│   │   ├── payments/
│   │   ├── expenses/
│   │   ├── categories/
│   │   ├── tax-rates/
│   │   └── user-profile/
│   ├── shared/                # Cross-cutting concerns
│   │   ├── types/            # Shared TypeScript types
│   │   ├── errors/           # Custom error classes
│   │   ├── utils/            # Utility functions
│   │   └── middleware/       # Shared middleware
│   └── server.ts             # Application entry point
├── tests/
│   ├── unit/                 # Unit test suites
│   ├── integration/          # Integration tests
│   └── fixtures/             # Test data fixtures
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Environment variables template
└── README.md                # Project documentation
```

### File Naming Conventions

- **Routes**: `{feature}.routes.ts` - HTTP endpoint definitions
- **Services**: `{feature}.service.ts` - Business logic implementation
- **Schemas**: `{feature}.schema.ts` - Zod validation schemas
- **Types**: Descriptive names like `client.types.ts`, `api.types.ts`
- **Utils**: Functional naming like `currency.ts`, `validation.ts`
- **Tests**: `{feature}.test.ts` - Test files with .test extension

### Key Entry Points

#### 1. Server Entry Point (`src/server.ts`)
```typescript
// Main server configuration and plugin registration
async function buildServer() {
  const server = Fastify({ /* config */ });
  
  // Plugin registration
  await server.register(cors);
  await server.register(helmet);
  await server.register(rateLimit);
  
  // Route registration
  await server.register(clientRoutes, { prefix: '/v1' });
  
  return server;
}
```

#### 2. Configuration (`src/config/index.ts`)
```typescript
// Environment-based configuration with validation
export const config = {
  server: { /* server config */ },
  supabase: { /* database config */ },
  cors: { /* CORS config */ },
  // ... other config sections
} as const;
```

#### 3. Feature Structure Example
```typescript
// clients/routes/client.routes.ts
export const clientRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/', { schema: { body: createClientSchema } }, createClientHandler);
  fastify.get('/', { schema: { querystring: listClientsSchema } }, listClientsHandler);
};

// clients/services/client.service.ts
export class ClientService {
  async create(userId: string, data: CreateClientDto): Promise<Client> {
    // Business logic implementation
  }
}
```

### Module Organization Principles

#### 1. Feature-Based Architecture
- Each feature contains routes, services, and schemas
- Clear separation of concerns
- Reusable components in shared directory

#### 2. Dependency Injection Pattern
```typescript
// Service dependency injection
export class ClientService {
  constructor(
    private supabase: SupabaseClient,
    private logger: Logger
  ) {}
}
```

#### 3. Export Strategy
```typescript
// Barrel exports for clean imports
// features/clients/schemas/index.ts
export { createClientSchema, updateClientSchema } from './client.schema';
export type { CreateClientDto, UpdateClientDto } from './client.types';
```

### Design Patterns Employed

#### 1. Repository Pattern (Abstracted through Supabase)
```typescript
export class BaseRepository {
  constructor(protected supabase: SupabaseClient) {}
  
  protected async create<T>(table: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    return result;
  }
}
```

#### 2. Service Layer Pattern
```typescript
export class ClientService {
  async create(userId: string, data: CreateClientDto): Promise<Client> {
    // Business logic validation
    // Database operations
    // Event emission
  }
}
```

#### 3. Middleware Chain Pattern
```typescript
// Request processing pipeline
server.addHook('preHandler', validateInput);
server.addHook('preHandler', authenticate);
server.addHook('preHandler', authorize);
```

#### 4. Factory Pattern for Server Creation
```typescript
export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify(config);
  await registerPlugins(server);
  await registerRoutes(server);
  return server;
}
```

---

## Design Decisions & Paradigms

### Architectural Patterns

#### Layered Architecture Rationale
**Decision**: Three-layer architecture (Routes → Services → Database)
**Justification**:
- Clear separation of concerns aids maintainability
- Easy to test each layer independently
- Facilitates team collaboration with clear boundaries
- Supports future migration to microservices if needed

**Trade-offs Considered**:
- Additional boilerplate vs. direct database access
- Performance overhead vs. maintainability gains
- Learning curve vs. long-term benefits

#### Feature-Based Organization
**Decision**: Organize code by business features rather than technical layers
**Justification**:
- Business logic co-location reduces cognitive load
- Easier to understand feature impact
- Facilitates feature flagging and A/B testing
- Supports team ownership of features

```typescript
// Traditional layer organization
src/
├── controllers/
├── services/
├── models/
└── routes/

// Chosen feature organization
src/
├── features/
│   ├── clients/
│   ├── projects/
│   └── payments/
└── shared/
```

### Technology Selection Rationale

#### Fastify vs. Express
**Decision**: Fastify over Express.js
**Justification**:
- 2x performance improvement in benchmarks
- Built-in validation and serialization
- Better TypeScript support
- Plugin ecosystem for modularity

**Performance Comparison**:
- Fastify: ~30,000 requests/second
- Express: ~15,000 requests/second

#### Supabase vs. Direct PostgreSQL
**Decision**: Supabase abstraction layer
**Justification**:
- Built-in authentication and RLS
- Real-time subscriptions capability
- Managed infrastructure reduces operational overhead
- Type-safe client with TypeScript

#### Zod vs. Joi/Yup
**Decision**: Zod for validation
**Justification**:
- TypeScript-first approach
- Type inference from schemas
- Better performance than alternatives
- Active development and community

### Data Management Decisions

#### Row Level Security (RLS) Strategy
**Decision**: Database-level multi-tenancy via RLS
**Justification**:
- Security enforced at data layer (defense in depth)
- No risk of application-level bypass
- Performance optimized by PostgreSQL
- Automatic query filtering

```sql
-- RLS Policy Example
CREATE POLICY tenant_isolation ON clients
  FOR ALL USING (auth.uid() = user_id);
```

#### Soft Delete Pattern
**Decision**: Soft deletes with `deleted_at` timestamps
**Justification**:
- Audit trail requirements for financial data
- Data recovery capabilities
- Compliance with retention policies
- User experience considerations

### Security Paradigm

#### Zero-Trust Security Model
**Decision**: Every request must be authenticated and authorized
**Justification**:
- Financial data requires highest security
- Prevents lateral movement in case of breach
- Aligns with modern security best practices
- Regulatory compliance requirements

#### JWT with RS256
**Decision**: RS256 algorithm for JWT tokens
**Justification**:
- Asymmetric cryptography enhances security
- Public/private key separation
- Better performance for token verification
- Industry standard for enterprise applications

### Development Paradigm

#### TypeScript Strict Mode
**Decision**: Enable all strict TypeScript checks
**Justification**:
- Compile-time error detection
- Better IDE support and autocomplete
- Self-documenting code
- Reduced runtime errors

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### Test-Driven Development (TDD)
**Decision**: Comprehensive test coverage with TDD principles
**Justification**:
- Financial software requires high reliability
- Regression prevention for critical features
- Living documentation through tests
- Refactoring confidence

#### Configuration as Code
**Decision**: Environment-based configuration with validation
**Justification**:
- Environment parity (dev/staging/prod)
- Configuration validation at startup
- Type-safe configuration access
- Secrets management integration

### Performance Considerations

#### Connection Pooling Strategy
**Decision**: Supabase managed connection pooling
**Justification**:
- Automatic scaling based on load
- Reduced connection overhead
- Built-in monitoring and optimization
- Focus on business logic over infrastructure

#### Caching Strategy
**Decision**: Application-level caching with Redis (future)
**Justification**:
- Session caching for authentication
- Query result caching for expensive operations
- Rate limiting storage
- Real-time data synchronization

---

## Testing Guide

### Test Suite Structure

#### Test Organization
```
tests/
├── unit/                          # Unit test suites
│   ├── services/
│   │   ├── client.service.test.ts
│   │   └── payment.service.test.ts
│   ├── middleware/
│   │   ├── auth.test.ts
│   │   └── validation.test.ts
│   └── utils/
│       ├── currency.test.ts
│       └── validation.test.ts
├── integration/                   # Integration test suites
│   ├── api/
│   │   ├── clients.test.ts
│   │   └── payments.test.ts
│   └── database/
│       ├── migration.test.ts
│       └── seeds.test.ts
├── fixtures/                     # Test data
│   ├── clients.json
│   ├── projects.json
│   └── payments.json
├── helpers/                      # Test utilities
│   ├── database.helper.ts
│   ├── auth.helper.ts
│   └── fixtures.helper.ts
└── setup/                        # Test configuration
    ├── vitest.config.ts
    └── test-setup.ts
```

### Step-by-Step Testing Instructions

#### 1. Environment Setup
```bash
# Install dependencies
npm install

# Set up test environment variables
cp .env.example .env.test

# Edit .env.test with test database credentials
NODE_ENV=test
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-test-service-key
```

#### 2. Database Test Setup
```bash
# Run test migrations
npm run test:migrate

# Seed test data
npm run test:seed

# Verify test database
npm run test:db:verify
```

#### 3. Running Tests

**All Tests**:
```bash
npm run test
```

**Unit Tests Only**:
```bash
npm run test:unit
```

**Integration Tests Only**:
```bash
npm run test:integration
```

**Watch Mode (Development)**:
```bash
npm run test:watch
```

**Coverage Report**:
```bash
npm run test:coverage
```

**Test UI (Interactive)**:
```bash
npm run test:ui
```

#### 4. Individual Test Execution
```bash
# Run specific test file
npx vitest tests/unit/services/client.service.test.ts

# Run tests matching pattern
npx vitest --grep "ClientService"

# Run tests in specific directory
npx vitest tests/integration/api/
```

### Test Environment Setup

#### Vitest Configuration (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests'),
    },
  },
});
```

#### Test Setup (`tests/setup/test-setup.ts`)
```typescript
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../src/config/index.js';

// Test database setup
beforeAll(async () => {
  // Initialize test database
  const testDb = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey
  );
  
  // Clean up test data
  await cleanupTestData(testDb);
});

beforeEach(async () => {
  // Reset test state
  await resetTestData();
});

afterEach(async () => {
  // Cleanup after each test
  await cleanupTestResources();
});

afterAll(async () => {
  // Final cleanup
  await closeDatabaseConnections();
});
```

### Interpreting Test Results

#### Test Output Format
```
✓ ClientService.create() (15ms)
✓ ClientService.findById() (8ms)
✓ ClientService.update() (12ms)
✓ ClientService.delete() (10ms)
✓ ClientService.list() (22ms)

 ✓ 5 tests passed (67ms)
 ✓ 5 tests skipped
 ✗ 2 tests failed

Failed Tests:
1) ClientService.create() validation
   Error: Name is required
   → at ClientService.create (src/services/client.service.ts:45:12)

Coverage Report:
----------------
File                    | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
client.service.ts       |   95.2  |    89.5  |   100   |   95.2
All files               |   87.3  |    82.1  |   91.2  |   87.3
```

#### Success Indicators
- ✓ Green checkmarks for passed tests
- Coverage percentages meeting thresholds
- Fast execution times (<100ms per test)
- No memory leaks or resource issues

#### Failure Analysis
1. **Assertion Failures**: Check expected vs. actual values
2. **Timeout Errors**: Investigate async operations or database queries
3. **Setup Failures**: Verify test environment configuration
4. **Integration Failures**: Check external service dependencies

### Coverage Expectations

#### Coverage Thresholds
```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    global: {
      branches: 80,    // Minimum 80% branch coverage
      functions: 80,   // Minimum 80% function coverage
      lines: 80,       // Minimum 80% line coverage
      statements: 80,  // Minimum 80% statement coverage
    },
  },
}
```

#### Coverage by Component Type
- **Services**: 90%+ coverage (critical business logic)
- **Routes**: 85%+ coverage (HTTP handlers)
- **Middleware**: 80%+ coverage (cross-cutting concerns)
- **Utilities**: 95%+ coverage (reusable functions)
- **Types**: 0% coverage (type definitions don't need tests)

#### Coverage Report Analysis
```
---------- Coverage Summary ----------
Statements   : 87.45% ( 350/400 )
Branches     : 82.1%  ( 120/146 )
Functions    : 91.2%  ( 45/50 )
Lines        : 87.3%  ( 345/395 )
=====================================
```

#### Improving Coverage
1. **Edge Cases**: Test boundary conditions and error scenarios
2. **Async Operations**: Test both success and failure paths
3. **Integration Points**: Test external service interactions
4. **Middleware Chains**: Test all middleware combinations

### Test Data Management

#### Fixtures Usage
```typescript
// tests/fixtures/clients.json
{
  "validClient": {
    "name": "Test Client",
    "email": "test@example.com",
    "phone": "+1234567890",
    "company": "Test Company"
  },
  "invalidClient": {
    "name": "",
    "email": "invalid-email"
  }
}

// Usage in test
import { validClient } from '@tests/fixtures/clients.json';

test('should create valid client', async () => {
  const result = await clientService.create(userId, validClient);
  expect(result).toBeDefined();
  expect(result.name).toBe(validClient.name);
});
```

#### Database Transactions
```typescript
test('should handle concurrent operations', async () => {
  await testDb.transaction(async (trx) => {
    // Test transaction isolation
    const client1 = await clientService.create(userId1, clientData1, trx);
    const client2 = await clientService.create(userId2, clientData2, trx);
    
    // Verify isolation
    expect(client1.user_id).not.toBe(client2.user_id);
  });
});
```

### Debugging Tests

#### Common Issues and Solutions

1. **Test Database Connection Issues**:
```bash
# Verify database connection
npm run test:db:verify

# Reset test database
npm run test:db:reset
```

2. **Async Test Timeouts**:
```typescript
// Increase timeout for slow tests
test('slow integration test', async () => {
  // Test code
}, { timeout: 10000 }); // 10 second timeout
```

3. **Test Isolation Problems**:
```typescript
// Ensure clean state between tests
beforeEach(async () => {
  await cleanupTestData();
});
```

#### Debugging Tools
```bash
# Run tests with debugger
node --inspect-brk node_modules/.bin/vitest tests/unit/client.service.test.ts

# Generate detailed coverage report
npm run test:coverage -- --reporter=html

# Run tests with verbose output
npx vitest --reporter=verbose
```

---

## Glossary

### A
**API (Application Programming Interface)**: Set of protocols and tools for building software applications. In BookLite, refers to the RESTful JSON API for bookkeeping operations.

**Authentication**: Process of verifying user identity. BookLite uses JWT tokens issued by Supabase Auth.

**Authorization**: Process of determining user permissions. Implemented through Row Level Security (RLS) in PostgreSQL.

### B
**Backend**: Server-side application that handles data processing, business logic, and API requests. BookLite backend is built with Fastify and TypeScript.

**Base URL**: Root URL for API endpoints. `https://api.booklite.app/v1` for production.

**Bearer Token**: Authentication token type used in Authorization headers. Format: `Authorization: Bearer <token>`.

### C
**Client**: In BookLite context, refers to customer or client management entity in the bookkeeping system.

**CORS (Cross-Origin Resource Sharing)**: Security mechanism that allows or denies cross-origin requests.

**CRUD**: Create, Read, Update, Delete operations for data management.

### D
**Database**: Organized collection of data. BookLite uses PostgreSQL via Supabase.

**DTO (Data Transfer Object)**: Object that carries data between processes. Used for request/response validation in BookLite.

### E
**Environment**: Deployment context (development, staging, production). Configuration varies by environment.

**ESLint**: JavaScript/TypeScript linting tool for code quality and consistency.

### F
**Fastify**: High-performance Node.js web framework used as the foundation of BookLite backend.

**Feature**: Business functionality area (clients, projects, payments, etc.). Code organization follows feature-based architecture.

### H
**Helmet**: Security middleware for Express/Fastify that sets various HTTP headers to protect against common web vulnerabilities.

**Hook**: Lifecycle event in Fastify for executing code at specific points during request processing.

### I
**Integration Test**: Test that verifies interaction between multiple components or systems.

**Index**: Database structure that improves query performance. BookLite uses indexes for frequently queried columns.

### J
**JWT (JSON Web Token)**: Compact, URL-safe means of representing claims to be transferred between two parties. Used for authentication in BookLite.

### L
**Layer**: Architectural component with specific responsibility (routes, services, database).

**Logging**: Process of recording application events. BookLite uses Pino for structured logging.

### M
**Middleware**: Function that processes requests before they reach route handlers.

**Migration**: Database schema change management. BookLite uses version-controlled migration scripts.

### O
**ORM (Object-Relational Mapping)**: Technique for converting data between incompatible systems. BookLite uses Supabase client instead of traditional ORM.

### P
**Package.json**: Node.js project configuration file defining dependencies and scripts.

**Plugin**: Extensible module in Fastify for adding functionality.

**PostgreSQL**: Open-source relational database system used by Supabase.

### R
**Rate Limiting**: Technique to control the rate of incoming requests to prevent abuse.

**Repository**: Pattern for isolating data access logic. Abstracted through Supabase in BookLite.

**RLS (Row Level Security)**: PostgreSQL feature for enforcing row-level access control.

**Route**: URL pattern and associated handler for processing HTTP requests.

**RPC (Remote Procedure Call)**: Protocol for calling procedures on remote systems. Supabase supports RPC calls.

### S
**Schema**: Database structure definition or validation schema using Zod.

**Service**: Business logic layer that processes requests and manages data operations.

**Supabase**: Open-source Firebase alternative providing database, auth, and storage services.

### T
**Tenant**: Customer or organization in multi-tenant architecture. BookLite isolates tenant data using RLS.

**Test**: Automated verification of application behavior. Includes unit, integration, and end-to-end tests.

**TypeScript**: Superset of JavaScript that adds static typing.

### U
**Unit Test**: Test that verifies individual components or functions in isolation.

**URL (Uniform Resource Locator)**: Address for resource on the internet.

### V
**Validation**: Process of verifying data conformity to rules and constraints.

**Vitest**: Modern testing framework used by BookLite for unit and integration tests.

### W
**Webhook**: HTTP callback that provides event notifications. Not currently implemented but planned for future integrations.

---

## Further Reading & References

### Official Documentation

#### Core Technologies
- **Fastify Documentation**: https://www.fastify.io/docs/latest/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Node.js Documentation**: https://nodejs.org/docs/
- **Zod Documentation**: https://zod.dev/

#### Database & Backend
- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Row Level Security Guide**: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **JWT Specification**: https://tools.ietf.org/html/rfc7519

#### Security
- **OWASP Security Guidelines**: https://owasp.org/
- **Helmet Security Headers**: https://helmetjs.github.io/
- **CORS Documentation**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Rate Limiting Best Practices**: https://docs.fastify.dev/docs/latest/Reference/Plugins/RateLimit/

#### Testing
- **Vitest Documentation**: https://vitest.dev/
- **Testing Best Practices**: https://github.com/goldbergyoni/javascript-testing-best-practices
- **Test Coverage Guidelines**: https://about.codecov.io/

### Development Resources

#### Architecture Patterns
- **Layered Architecture**: https://patterns.dev/posts/layered-architecture/
- **Feature-Driven Development**: https://en.wikipedia.org/wiki/Feature-driven_development
- **Repository Pattern**: https://martinfowler.com/eaaCatalog/repository.html

#### Node.js Performance
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **Fastify Performance Guide**: https://www.fastify.io/docs/latest/Guides/Performance-Tips/
- **Node.js Scaling**: https://nodejs.org/en/docs/guides/dont-block-the-event-loop/

#### Security Resources
- **JWT Security Best Practices**: https://auth0.com/blog/jwt-security-best-practices/
- **PostgreSQL Security**: https://www.postgresql.org/docs/current/security.html
- **API Security Checklist**: https://github.com/assetnote/knowledge-base/blob/master/api-security-checklist.md

### BookLite Specific Resources

#### Internal Documentation
- **API Specification**: `/specs/api-specification.md`
- **Database Schema**: `/specs/database-implementation.md`
- **Project Structure**: `/specs/project-structure.md`
- **Security Policy**: `/specs/security-and-authentication-policy.md`

#### Configuration Reference
- **Environment Variables**: `.env.example`
- **TypeScript Configuration**: `tsconfig.json`
- **Package Configuration**: `package.json`
- **Test Configuration**: `vitest.config.ts`

### Community & Support

#### Open Source Projects
- **Fastify GitHub**: https://github.com/fastify/fastify
- **Supabase GitHub**: https://github.com/supabase/supabase
- **Zod GitHub**: https://github.com/colinhacks/zod
- **Vitest GitHub**: https://github.com/vitest-dev/vitest

#### Learning Resources
- **Modern TypeScript Tutorial**: https://www.typescripttutorial.net/
- **REST API Design Guide**: https://restfulapi.net/
- **Database Design Principles**: https://www.databasestar.com/database-design/

#### Tools & Extensions
- **VS Code Extensions**: Recommended extensions for TypeScript development
- **Database Tools**: pgAdmin, DBeaver for PostgreSQL management
- **API Testing**: Postman collections for BookLite API endpoints
- **Performance Monitoring**: Application performance monitoring tools

### Standards & Compliance

#### Financial Regulations
- **Accounting Standards**: Relevant accounting standards for bookkeeping software
- **Data Protection**: GDPR and privacy regulations compliance
- **Financial Security**: PCI-DSS and financial data security requirements

#### Web Standards
- **HTTP/1.1 Specification**: https://tools.ietf.org/html/rfc7231
- **JSON Schema**: https://json-schema.org/
- **OpenAPI Specification**: https://swagger.io/specification/

---

## Appendix

### Quick Reference Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
```

### Environment Variables Quick Reference

```bash
# Required Variables
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional Variables
PORT=3000
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:4321
RATE_LIMIT_GLOBAL=100
```

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| 400 | Bad Request | Check request body validation |
| 401 | Unauthorized | Verify JWT token is valid |
| 403 | Forbidden | Check user permissions |
| 404 | Not Found | Verify resource exists |
| 429 | Too Many Requests | Implement rate limiting |
| 500 | Internal Error | Check server logs |

### Performance Benchmarks

| Operation | Average Response Time | 95th Percentile |
|-----------|---------------------|-----------------|
| Client CRUD | 45ms | 120ms |
| Payment CRUD | 62ms | 150ms |
| Project Queries | 38ms | 95ms |
| Auth Validation | 25ms | 60ms |

---

*This technical manual is maintained by the BookLite development team and updated regularly to reflect system changes and improvements.*