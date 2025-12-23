# Booklite Test Setup Guide

## Overview

This guide provides step-by-step instructions for setting up and running the Booklite API test suite.

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Specification - Ready for Implementation

## Prerequisites

### Required Software

- **Node.js**: >= 20.x
- **npm**: >= 10.x
- **PostgreSQL**: >= 14.x (for test database)
- **Git**: Latest version

### Environment Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/jeffn0rD/booklite.git
   cd booklite/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Install Development Dependencies**
   ```bash
   npm install --save-dev vitest @vitest/ui c8 @faker-js/faker supertest @types/supertest
   ```

## Test Database Setup

### 1. Create Test Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE booklite_test;
\q
```

### 2. Configure Supabase Test Project

1. Create a new Supabase project for testing
2. Note the project URL and service role key
3. Run database migrations on test project

```bash
# Set environment variables
export TEST_SUPABASE_URL="https://your-test-project.supabase.co"
export TEST_SUPABASE_SERVICE_KEY="your-service-role-key"

# Run migrations
npm run migrate:test
```

### 3. Environment Variables

Create `.env.test` file:

```env
# Test Database
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_ANON_KEY=your-anon-key
TEST_SUPABASE_SERVICE_KEY=your-service-role-key

# Test Configuration
NODE_ENV=test
PORT=3001
LOG_LEVEL=error

# Test JWT
TEST_JWT_SECRET=test-secret-key-for-testing-only

# Disable external services in tests
DISABLE_EMAIL=true
DISABLE_STORAGE=true
DISABLE_PDF=true
```

## Project Structure Setup

### 1. Create Test Directories

```bash
mkdir -p backend/tests/{unit,integration,e2e,fixtures,mocks,utils}
mkdir -p backend/tests/unit/{services,utils,schemas}
mkdir -p backend/tests/integration/{auth,clients,projects,documents,payments,expenses}
```

### 2. Install Test Configuration

Create `backend/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/',
        '**/mocks/',
        'dist/'
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
});
```

### 3. Create Global Setup File

Create `backend/tests/setup.ts`:

```typescript
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { setupTestDatabase, closeTestDatabase, resetDatabase } from './utils/test-db';
import { setupTestServer, closeTestServer } from './utils/test-server';

let testDb: any;
let testServer: any;

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Setup test database
  testDb = await setupTestDatabase();
  
  // Setup test server
  testServer = await setupTestServer();
  
  console.log('Test environment initialized');
});

afterAll(async () => {
  // Close test server
  if (testServer) {
    await closeTestServer(testServer);
  }
  
  // Close database connections
  if (testDb) {
    await closeTestDatabase(testDb);
  }
  
  console.log('Test environment cleaned up');
});

beforeEach(async () => {
  // Reset database state before each test
  if (testDb) {
    await resetDatabase(testDb);
  }
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});
```

### 4. Create Test Utilities

Create `backend/tests/utils/test-db.ts`:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export async function setupTestDatabase(): Promise<SupabaseClient> {
  supabaseClient = createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SUPABASE_SERVICE_KEY!
  );
  
  // Run migrations if needed
  await runMigrations(supabaseClient);
  
  return supabaseClient;
}

export async function closeTestDatabase(client: SupabaseClient): Promise<void> {
  // Supabase client doesn't need explicit closing
  supabaseClient = null;
}

export async function resetDatabase(client: SupabaseClient): Promise<void> {
  // Truncate all tables in reverse order of dependencies
  const tables = [
    'audit_logs',
    'official_copies',
    'email_logs',
    'payments',
    'document_line_items',
    'documents',
    'expenses',
    'projects',
    'clients',
    'attachments',
    'tax_rates',
    'categories',
    'user_sessions',
    'user_profile'
  ];
  
  for (const table of tables) {
    await client.from(table).delete().neq('id', 0);
  }
}

async function runMigrations(client: SupabaseClient): Promise<void> {
  // Check if migrations are needed
  // This is a simplified version - in production, use a proper migration tool
  const { data, error } = await client
    .from('user_profile')
    .select('id')
    .limit(1);
  
  if (error && error.code === '42P01') {
    // Table doesn't exist, run migrations
    console.log('Running database migrations...');
    // Execute migration SQL files
  }
}

export async function seedTestData(client: SupabaseClient): Promise<void> {
  const { seedDatabase } = await import('./seed');
  await seedDatabase(client);
}
```

Create `backend/tests/utils/test-server.ts`:

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';

let app: FastifyInstance | null = null;

export async function setupTestServer(): Promise<FastifyInstance> {
  app = Fastify({
    logger: false
  });
  
  // Register Supabase plugin
  app.decorate('supabase', createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SUPABASE_SERVICE_KEY!
  ));
  
  // Register authentication plugin
  await app.register(require('@/plugins/auth'));
  
  // Register all routes
  await app.register(require('@/features/auth/routes/auth.routes'), { prefix: '/v1' });
  await app.register(require('@/features/clients/routes/client.routes'), { prefix: '/v1' });
  await app.register(require('@/features/projects/routes/project.routes'), { prefix: '/v1' });
  await app.register(require('@/features/documents/routes/document.routes'), { prefix: '/v1' });
  await app.register(require('@/features/payments/routes/payment.routes'), { prefix: '/v1' });
  await app.register(require('@/features/expenses/routes/expense.routes'), { prefix: '/v1' });
  
  await app.ready();
  
  return app;
}

export async function closeTestServer(server: FastifyInstance): Promise<void> {
  await server.close();
  app = null;
}

export function getTestServer(): FastifyInstance {
  if (!app) {
    throw new Error('Test server not initialized');
  }
  return app;
}
```

Create `backend/tests/utils/helpers.ts`:

```typescript
import { FastifyInstance } from 'fastify';

export async function registerAndLogin(
  app: FastifyInstance,
  email: string = 'test@example.com',
  password: string = 'SecurePass123!'
) {
  // Register user
  const registerResponse = await app.inject({
    method: 'POST',
    url: '/v1/auth/register',
    payload: {
      email,
      password,
      business_name: 'Test Business'
    }
  });
  
  const { user, session } = registerResponse.json().data;
  
  return {
    user_id: user.id,
    access_token: session.access_token,
    refresh_token: session.refresh_token
  };
}

export async function createTestClient(
  app: FastifyInstance,
  authToken: string,
  overrides?: any
) {
  const response = await app.inject({
    method: 'POST',
    url: '/v1/clients',
    headers: {
      authorization: `Bearer ${authToken}`
    },
    payload: {
      name: 'Test Client',
      email: 'client@example.com',
      ...overrides
    }
  });
  
  return response.json().data;
}

export async function createTestProject(
  app: FastifyInstance,
  authToken: string,
  clientId: number,
  overrides?: any
) {
  const response = await app.inject({
    method: 'POST',
    url: '/v1/projects',
    headers: {
      authorization: `Bearer ${authToken}`
    },
    payload: {
      client_id: clientId,
      name: 'Test Project',
      status: 'Active',
      ...overrides
    }
  });
  
  return response.json().data;
}

export async function createDraftInvoice(
  app: FastifyInstance,
  authToken: string,
  clientId: number,
  lineItems?: any[]
) {
  const response = await app.inject({
    method: 'POST',
    url: '/v1/documents',
    headers: {
      authorization: `Bearer ${authToken}`
    },
    payload: {
      client_id: clientId,
      type: 'Invoice',
      line_items: lineItems || [
        {
          description: 'Test Service',
          quantity: 1,
          unit_price_cents: 100000,
          tax_rate_id: 1
        }
      ]
    }
  });
  
  return response.json().data;
}

export async function finalizeInvoice(
  app: FastifyInstance,
  authToken: string,
  invoiceId: number
) {
  const response = await app.inject({
    method: 'POST',
    url: `/v1/documents/${invoiceId}/finalize`,
    headers: {
      authorization: `Bearer ${authToken}`
    }
  });
  
  return response.json().data;
}
```

## Running Tests

### NPM Scripts

Add to `backend/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "vitest run tests/e2e",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:ci": "vitest run --coverage --reporter=json --reporter=html"
  }
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run specific test file
npm test -- client.service.test.ts

# Run tests matching pattern
npm test -- --grep "ClientService"
```

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: booklite_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        working-directory: backend
        run: npm ci
      
      - name: Run linting
        working-directory: backend
        run: npm run lint
      
      - name: Run type checking
        working-directory: backend
        run: npm run type-check
      
      - name: Run tests
        working-directory: backend
        run: npm run test:ci
        env:
          TEST_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          TEST_SUPABASE_SERVICE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_KEY }}
          NODE_ENV: test
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/coverage-final.json
          flags: backend
          name: backend-coverage
      
      - name: Check coverage thresholds
        working-directory: backend
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem**: Tests fail with "connection refused" errors

**Solution**:
```bash
# Check if test database is running
psql -U postgres -d booklite_test -c "SELECT 1"

# Verify environment variables
echo $TEST_SUPABASE_URL
echo $TEST_SUPABASE_SERVICE_KEY
```

#### 2. Test Timeouts

**Problem**: Tests timeout after 10 seconds

**Solution**:
```typescript
// Increase timeout for specific test
it('slow operation', async () => {
  // test code
}, 30000); // 30 second timeout

// Or in vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 30000
  }
});
```

#### 3. Flaky Tests

**Problem**: Tests pass sometimes and fail other times

**Solution**:
```typescript
// Ensure proper cleanup
afterEach(async () => {
  await resetDatabase();
  vi.clearAllMocks();
});

// Use deterministic data
const fixedDate = new Date('2024-01-01T00:00:00.000Z');
vi.setSystemTime(fixedDate);
```

#### 4. Mock Not Working

**Problem**: Mocks are not being called

**Solution**:
```typescript
// Clear mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Verify mock was called
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `beforeEach` to reset state
- Don't rely on test execution order

### 2. Descriptive Test Names

```typescript
// Good
it('should return 404 when client does not exist', async () => {});

// Bad
it('test client', async () => {});
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should create client', async () => {
  // Arrange
  const clientData = { name: 'Test', email: 'test@example.com' };
  
  // Act
  const result = await clientService.create(userId, clientData);
  
  // Assert
  expect(result.name).toBe('Test');
});
```

### 4. Use Fixtures

```typescript
import { testClient } from '@tests/fixtures/clients';

it('should update client', async () => {
  const result = await clientService.update(userId, testClient.id, updates);
  expect(result).toBeDefined();
});
```

### 5. Mock External Services

```typescript
import { createMockEmailService } from '@tests/mocks/email';

const mockEmail = createMockEmailService();
// Use mockEmail in tests
```

## Maintenance

### Regular Tasks

1. **Update Fixtures**: Keep test data current with schema changes
2. **Review Coverage**: Ensure coverage stays above 80%
3. **Fix Flaky Tests**: Address intermittent failures immediately
4. **Update Mocks**: Keep mocks in sync with real services
5. **Refactor Tests**: Improve test quality and readability

### Monitoring

- Track test execution time
- Monitor coverage trends
- Identify slow tests
- Review failure patterns

## Summary

This guide provides everything needed to:

- Set up test environment
- Configure test database
- Create test utilities
- Run tests locally and in CI/CD
- Troubleshoot common issues
- Follow best practices

**Next Steps**:
1. Follow setup instructions
2. Run existing tests
3. Write new tests
4. Achieve 80%+ coverage
5. Integrate with CI/CD

---

**Related Documents**:
- [Test Strategy](./test-strategy.md)
- [Unit Tests Specification](./unit-tests-specification.md)
- [Integration Tests Specification](./integration-tests-specification.md)
- [Test Data Specification](./test-data-specification.md)