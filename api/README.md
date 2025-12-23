# Booklite API Implementation

This directory contains the API implementation code, schemas, and utilities for the Booklite application.

## Directory Structure

```
api/
├── routes/          # API route handlers
├── schemas/         # Validation schemas (Zod)
├── middleware/      # Express/Fastify middleware
├── services/        # Business logic services
├── utils/           # Utility functions
└── README.md        # This file
```

## Technology Stack

- **Framework**: Fastify (Node.js/TypeScript)
- **Validation**: Zod
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (JWT)
- **ORM**: Supabase JS Client
- **Testing**: Jest + Supertest

## Getting Started

### Prerequisites

```bash
Node.js >= 20.x
npm >= 10.x
```

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API
PORT=3000
NODE_ENV=development
API_VERSION=v1

# CORS
CORS_ORIGIN=http://localhost:4321

# Rate Limiting
RATE_LIMIT_GLOBAL=100
RATE_LIMIT_PER_USER=1000

# JWT
JWT_SECRET=your-jwt-secret

# Storage
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_BUCKET_NAME=booklite-storage

# Email
EMAIL_PROVIDER=postmark
POSTMARK_API_KEY=your-postmark-key
EMAIL_FROM=noreply@booklite.app

# PDF Generation
PDF_SERVICE_URL=http://localhost:3001
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Routes

### Authentication
- `POST /v1/auth/register` - Register new user
- `POST /v1/auth/login` - Login
- `POST /v1/auth/logout` - Logout
- `POST /v1/auth/refresh` - Refresh token

### Resources
- `/v1/user-profile` - User profile management
- `/v1/clients` - Client management
- `/v1/projects` - Project management
- `/v1/documents` - Document (quotes/invoices) management
- `/v1/payments` - Payment management
- `/v1/expenses` - Expense management
- `/v1/categories` - Category management
- `/v1/tax-rates` - Tax rate management
- `/v1/attachments` - File upload/download
- `/v1/reports` - Reporting endpoints

## Code Examples

### Route Handler Example

```typescript
// routes/clients.ts
import { FastifyPluginAsync } from 'fastify';
import { createClientSchema, updateClientSchema } from '../schemas/client';
import { ClientService } from '../services/client';

export const clientRoutes: FastifyPluginAsync = async (fastify) => {
  const clientService = new ClientService(fastify.supabase);

  // List clients
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: listClientsQuerySchema,
      response: {
        200: listClientsResponseSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const clients = await clientService.list(userId, request.query);
    return { data: clients };
  });

  // Create client
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: {
      body: createClientSchema,
      response: {
        201: clientResponseSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const client = await clientService.create(userId, request.body);
    reply.code(201);
    return { data: client };
  });
};
```

### Schema Example

```typescript
// schemas/client.ts
import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  billing_address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().regex(/^[A-Z]{2}$/).optional()
  }).optional(),
  tax_vat_id: z.string().max(50).optional(),
  default_tax_rate_id: z.number().int().positive().optional(),
  default_payment_terms_days: z.number().int().min(0).max(365).optional()
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
```

### Service Example

```typescript
// services/client.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateClientInput } from '../schemas/client';

export class ClientService {
  constructor(private supabase: SupabaseClient) {}

  async list(userId: string, query: any) {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .is('archived_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async create(userId: string, input: CreateClientInput) {
    const { data, error } = await this.supabase
      .from('clients')
      .insert({ ...input, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async get(userId: string, id: number) {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async update(userId: string, id: number, input: Partial<CreateClientInput>) {
    const { data, error } = await this.supabase
      .from('clients')
      .update(input)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(userId: string, id: number) {
    const { error } = await this.supabase
      .from('clients')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
```

### Middleware Example

```typescript
// middleware/auth.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        type: 'https://api.booklite.app/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Missing or invalid authorization header',
        instance: request.url
      });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return reply.code(401).send({
        type: 'https://api.booklite.app/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Invalid or expired token',
        instance: request.url
      });
    }

    request.user = user;
  } catch (error) {
    return reply.code(401).send({
      type: 'https://api.booklite.app/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Authentication failed',
      instance: request.url
    });
  }
}
```

## Testing

### Unit Test Example

```typescript
// tests/services/client.test.ts
import { ClientService } from '../../services/client';
import { createMockSupabaseClient } from '../mocks/supabase';

describe('ClientService', () => {
  let clientService: ClientService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    clientService = new ClientService(mockSupabase);
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const userId = 'user-123';
      const input = {
        name: 'Acme Corp',
        email: 'billing@acme.com'
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 1, ...input, user_id: userId },
              error: null
            })
          })
        })
      });

      const result = await clientService.create(userId, input);

      expect(result).toEqual({
        id: 1,
        ...input,
        user_id: userId
      });
    });
  });
});
```

### Integration Test Example

```typescript
// tests/routes/clients.test.ts
import { build } from '../helper';

describe('Client Routes', () => {
  let app: any;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/clients', () => {
    it('should create a new client', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: {
          authorization: 'Bearer valid-token'
        },
        payload: {
          name: 'Acme Corp',
          email: 'billing@acme.com'
        }
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        data: {
          name: 'Acme Corp',
          email: 'billing@acme.com'
        }
      });
    });

    it('should return 401 without auth', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/clients',
        payload: {
          name: 'Acme Corp',
          email: 'billing@acme.com'
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
```

## Error Handling

All errors follow RFC 7807 Problem Details format:

```typescript
// utils/errors.ts
export class ApiError extends Error {
  constructor(
    public type: string,
    public title: string,
    public status: number,
    public detail: string,
    public errors?: Array<{ field: string; message: string; code: string }>
  ) {
    super(detail);
  }

  toJSON() {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.detail,
      errors: this.errors
    };
  }
}

export class ValidationError extends ApiError {
  constructor(detail: string, errors: Array<any>) {
    super(
      'https://api.booklite.app/errors/validation-error',
      'Validation Error',
      400,
      detail,
      errors
    );
  }
}

export class UnauthorizedError extends ApiError {
  constructor(detail: string = 'Unauthorized') {
    super(
      'https://api.booklite.app/errors/unauthorized',
      'Unauthorized',
      401,
      detail
    );
  }
}
```

## Deployment

### Railway Deployment

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

### Environment Variables (Production)

Set these in Railway dashboard:
- All variables from `.env`
- `NODE_ENV=production`
- Database connection strings
- API keys and secrets

## Documentation

- [API Specification](../specs/api-specification.md)
- [API Endpoints Reference](../specs/api-endpoints-reference.md)
- [API Schemas](../specs/api-schemas.md)
- [Database Schema](../sql/README.md)

## Contributing

1. Create feature branch
2. Write tests
3. Implement feature
4. Run tests and linting
5. Submit pull request

## License

Copyright © 2024 Booklite. All rights reserved.