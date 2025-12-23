# Development Guide

This comprehensive guide covers setup, development workflows, and best practices for the Booklite project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Git**: Latest version
- **Docker**: Latest version (optional, for local development)
- **Supabase Account**: For database and authentication

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/jeffn0rD/booklite.git
   cd booklite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   
   # Edit the .env files with your configuration
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Copy the project URL and anon key
   - Run database migrations:
     ```bash
     # Using Supabase CLI
     supabase db push
     
     # Or manually execute SQL files
     psql $DATABASE_URL -f sql/migration_up.sql
     ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:4321
   - Backend: http://localhost:3000

---

## Development Workflow

### Daily Development

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Make changes and test**
   ```bash
   # Run tests
   npm run test
   
   # Run linter
   npm run lint
   
   # Format code
   npm run format
   ```

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```bash
git commit -m "feat: add client search functionality"
git commit -m "fix: resolve invoice calculation bug"
git commit -m "docs: update API documentation"
```

---

## Project Structure

### Monorepo Organization

```
booklite/
├── frontend/          # Astro/Svelte frontend
├── backend/           # Fastify backend
├── shared/            # Shared code
├── docs/              # Documentation
├── specs/             # Specifications
├── sql/               # Database migrations
└── tools/             # Development tools
```

### Feature-Based Structure

Each feature module contains:
- `components/` - UI components (frontend)
- `routes/` - API routes (backend)
- `services/` - Business logic (backend)
- `schemas/` - Validation schemas
- `types/` - TypeScript types
- `utils/` - Utility functions

### Adding a New Feature

1. **Create feature directory**
   ```bash
   # Frontend
   mkdir -p frontend/src/features/your-feature/{components,hooks,utils,types,api}
   
   # Backend
   mkdir -p backend/src/features/your-feature/{routes,services,schemas,types,utils}
   ```

2. **Create index file**
   ```typescript
   // frontend/src/features/your-feature/index.ts
   export * from './components';
   export * from './hooks';
   export * from './api';
   ```

3. **Add feature to routing**
   ```typescript
   // frontend/src/pages/your-feature/index.astro
   // backend/src/features/your-feature/routes/yourFeature.routes.ts
   ```

---

## Coding Standards

### TypeScript

- **Strict mode**: Always enabled
- **Type annotations**: Required for function parameters and return types
- **Interfaces vs Types**: Use interfaces for objects, types for unions/intersections
- **Naming conventions**:
  - PascalCase: Components, Classes, Interfaces, Types
  - camelCase: Variables, Functions, Methods
  - UPPER_SNAKE_CASE: Constants

Example:
```typescript
// Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

const MAX_RETRIES = 3;

// Avoid
interface user { // Should be PascalCase
  ID: string; // Should be camelCase
}
```

### Svelte Components

```svelte
<script lang="ts">
  // Imports
  import { onMount } from 'svelte';
  
  // Props
  export let title: string;
  export let items: Item[] = [];
  
  // State
  let isLoading = false;
  
  // Lifecycle
  onMount(() => {
    // ...
  });
  
  // Functions
  function handleClick() {
    // ...
  }
</script>

<div class="container">
  <h1>{title}</h1>
  <!-- ... -->
</div>

<style>
  .container {
    /* ... */
  }
</style>
```

### API Routes

```typescript
// backend/src/features/clients/routes/clients.routes.ts
import { FastifyPluginAsync } from 'fastify';
import { ClientService } from '../services/client.service';
import { createClientSchema } from '../schemas/client.schema';

export const clientRoutes: FastifyPluginAsync = async (fastify) => {
  const clientService = new ClientService(fastify.supabase);

  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: listClientsResponseSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const clients = await clientService.list(userId);
    return { data: clients };
  });
};
```

### Error Handling

```typescript
// Custom error classes
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

// Usage
throw new ApiError(404, 'Client not found', 'CLIENT_NOT_FOUND');

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof ApiError) {
    return reply.code(error.statusCode).send({
      type: `https://api.booklite.app/errors/${error.code}`,
      title: error.message,
      status: error.statusCode,
      detail: error.message,
      instance: request.url
    });
  }
  
  // Handle other errors
  reply.code(500).send({
    type: 'https://api.booklite.app/errors/internal-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred'
  });
});
```

---

## Testing

### Unit Tests

```typescript
// Example: Service unit test
import { ClientService } from './client.service';
import { createMockSupabaseClient } from '../../test/mocks';

describe('ClientService', () => {
  let service: ClientService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    service = new ClientService(mockSupabase);
  });

  describe('list', () => {
    it('should return list of clients', async () => {
      const mockClients = [
        { id: 1, name: 'Client 1' },
        { id: 2, name: 'Client 2' }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockClients,
            error: null
          })
        })
      });

      const result = await service.list('user-123');
      expect(result).toEqual(mockClients);
    });
  });
});
```

### Integration Tests

```typescript
// Example: API integration test
import { build } from '../helper';

describe('Client Routes', () => {
  let app: any;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /clients', () => {
    it('should create a new client', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: {
          authorization: 'Bearer valid-token'
        },
        payload: {
          name: 'Test Client',
          email: 'test@example.com'
        }
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        data: {
          name: 'Test Client',
          email: 'test@example.com'
        }
      });
    });
  });
});
```

### E2E Tests

```typescript
// Example: Playwright E2E test
import { test, expect } from '@playwright/test';

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a new client', async ({ page }) => {
    await page.goto('/clients');
    await page.click('button:has-text("New Client")');
    
    await page.fill('[name="name"]', 'Test Client');
    await page.fill('[name="email"]', 'client@example.com');
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('text=Test Client')).toBeVisible();
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## Deployment

### Frontend Deployment (Cloudflare Pages)

1. **Manual deployment**
   ```bash
   npm run build:frontend
   npx wrangler pages publish frontend/dist
   ```

2. **Automatic deployment**
   - Push to `main` branch
   - GitHub Actions automatically deploys

### Backend Deployment (Railway)

1. **Manual deployment**
   ```bash
   railway login
   railway link
   railway up
   ```

2. **Automatic deployment**
   - Push to `main` branch
   - GitHub Actions automatically deploys

### Database Migrations

```bash
# Run migrations
npm run migrate:prod

# Rollback migration
npm run migrate:rollback

# Create new migration
npm run migrate:create migration-name
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Reset database
npm run db:reset
```

#### Build Failures
```bash
# Clear cache
rm -rf node_modules dist .astro
npm install
npm run build
```

#### Type Errors
```bash
# Regenerate types
npm run type-check

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Backend debug
NODE_ENV=development DEBUG=fastify:* npm run dev:backend

# Frontend debug
npm run dev:frontend -- --verbose
```

### Getting Help

1. Check documentation in `/docs`
2. Review specifications in `/specs`
3. Search existing issues on GitHub
4. Create new issue with reproduction steps

---

## Best Practices

### Performance

- Use lazy loading for routes
- Implement pagination for lists
- Cache API responses
- Optimize images
- Use CDN for static assets

### Security

- Never commit secrets
- Use environment variables
- Validate all inputs
- Sanitize user data
- Implement rate limiting
- Use HTTPS only

### Code Quality

- Write tests for new features
- Keep functions small and focused
- Use meaningful variable names
- Add comments for complex logic
- Follow DRY principle
- Regular code reviews

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Specification - Ready for Implementation