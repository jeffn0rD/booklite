# Booklite Test Strategy

## Overview

This document outlines the comprehensive testing strategy for the Booklite API, ensuring high quality, reliability, and maintainability of the codebase.

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Specification - Ready for Implementation

## Testing Philosophy

### Core Principles

1. **Test-Driven Development (TDD)**: Write tests before implementation when possible
2. **Comprehensive Coverage**: Aim for 80%+ overall coverage, 90%+ for critical paths
3. **Fast Feedback**: Tests should run quickly to enable rapid iteration
4. **Isolated Tests**: Each test should be independent and not rely on others
5. **Realistic Scenarios**: Tests should reflect real-world usage patterns
6. **Clear Documentation**: Tests serve as living documentation of system behavior

### Testing Pyramid

```
        /\
       /  \
      / E2E \
     /--------\
    /          \
   / Integration \
  /--------------\
 /                \
/   Unit Tests     \
--------------------
```

- **Unit Tests (70%)**: Fast, isolated tests of individual functions and methods
- **Integration Tests (25%)**: Test API endpoints and database interactions
- **E2E Tests (5%)**: Critical user flows through the entire system

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions, methods, and components in isolation

**Scope**:
- Service layer business logic
- Utility functions
- Validation schemas
- Data transformations
- Calculations and formatting

**Characteristics**:
- Fast execution (< 1ms per test)
- No external dependencies
- Use mocks for database, APIs, services
- High coverage (90%+)

**Tools**:
- **Framework**: Vitest
- **Mocking**: Vitest mocks
- **Assertions**: Vitest expect API

### 2. Integration Tests

**Purpose**: Test API endpoints and their interactions with the database

**Scope**:
- HTTP endpoints (all CRUD operations)
- Authentication and authorization
- Database queries and transactions
- Request/response handling
- Error handling and validation

**Characteristics**:
- Moderate execution time (10-100ms per test)
- Use test database
- Real HTTP requests
- Test complete request/response cycle

**Tools**:
- **Framework**: Vitest
- **HTTP Testing**: Supertest or direct Fastify inject
- **Database**: Test PostgreSQL instance
- **Fixtures**: Predefined test data

### 3. End-to-End Tests

**Purpose**: Test critical user flows through the entire system

**Scope**:
- User registration and login
- Creating and finalizing invoices
- Payment processing
- Document generation and email sending

**Characteristics**:
- Slower execution (1-10s per test)
- Use staging environment
- Test full stack integration
- Focus on critical paths only

**Tools**:
- **Framework**: Playwright
- **Browser**: Chromium
- **API**: Real backend endpoints

## Test Organization

### Directory Structure

```
backend/tests/
├── unit/                           # Unit tests
│   ├── services/                   # Service layer tests
│   │   ├── client.service.test.ts
│   │   ├── project.service.test.ts
│   │   ├── document.service.test.ts
│   │   ├── payment.service.test.ts
│   │   └── expense.service.test.ts
│   ├── utils/                      # Utility function tests
│   │   ├── currency.test.ts
│   │   ├── validation.test.ts
│   │   ├── formatting.test.ts
│   │   └── calculations.test.ts
│   └── schemas/                    # Schema validation tests
│       ├── client.schema.test.ts
│       ├── project.schema.test.ts
│       ├── document.schema.test.ts
│       ├── payment.schema.test.ts
│       └── expense.schema.test.ts
├── integration/                    # Integration tests
│   ├── auth/                       # Authentication tests
│   │   ├── register.test.ts
│   │   ├── login.test.ts
│   │   ├── refresh.test.ts
│   │   └── logout.test.ts
│   ├── clients/                    # Client endpoint tests
│   │   ├── create.test.ts
│   │   ├── list.test.ts
│   │   ├── get.test.ts
│   │   ├── update.test.ts
│   │   └── delete.test.ts
│   ├── projects/                   # Project endpoint tests
│   ├── documents/                  # Document endpoint tests
│   ├── payments/                   # Payment endpoint tests
│   ├── expenses/                   # Expense endpoint tests
│   ├── categories/                 # Category endpoint tests
│   ├── tax-rates/                  # Tax rate endpoint tests
│   └── reports/                    # Report endpoint tests
├── e2e/                           # End-to-end tests
│   ├── user-registration.spec.ts
│   ├── invoice-workflow.spec.ts
│   ├── payment-processing.spec.ts
│   └── document-generation.spec.ts
├── fixtures/                       # Test data fixtures
│   ├── users.ts
│   ├── clients.ts
│   ├── projects.ts
│   ├── documents.ts
│   ├── payments.ts
│   ├── expenses.ts
│   ├── categories.ts
│   └── tax-rates.ts
├── mocks/                         # Mock implementations
│   ├── supabase.ts
│   ├── email.ts
│   ├── storage.ts
│   └── pdf.ts
├── utils/                         # Test utilities
│   ├── test-server.ts            # Test server setup
│   ├── test-db.ts                # Test database utilities
│   ├── factories.ts              # Data factories
│   ├── assertions.ts             # Custom assertions
│   └── helpers.ts                # Test helpers
├── setup.ts                       # Global test setup
├── teardown.ts                    # Global test teardown
└── vitest.config.ts              # Vitest configuration
```

### File Naming Convention

- **Unit Tests**: `[name].test.ts`
- **Integration Tests**: `[endpoint].test.ts`
- **E2E Tests**: `[flow].spec.ts`
- **Fixtures**: `[entity].ts`
- **Mocks**: `[service].ts`

## Test Coverage Requirements

### Overall Coverage Targets

| Category | Target | Critical |
|----------|--------|----------|
| Overall | 80%+ | 90%+ |
| Service Layer | 90%+ | 95%+ |
| Route Handlers | 85%+ | 90%+ |
| Utility Functions | 95%+ | 100% |
| Schemas | 90%+ | 95%+ |

### Critical Paths (100% Coverage Required)

1. **Authentication & Authorization**
   - User registration
   - Login/logout
   - Token refresh
   - JWT validation
   - RLS enforcement

2. **Financial Operations**
   - Document finalization
   - Payment processing
   - Balance calculations
   - Tax calculations
   - Currency conversions

3. **Data Integrity**
   - Document number generation
   - Status transitions
   - Cascade operations
   - Constraint enforcement

4. **Security**
   - User isolation
   - Permission checks
   - Input validation
   - SQL injection prevention
   - XSS prevention

## Test Data Management

### Fixtures

**Purpose**: Provide consistent, reusable test data

**Strategy**:
- Define base fixtures for each entity
- Use factory functions for variations
- Keep fixtures minimal and focused
- Version control all fixtures

**Example**:
```typescript
export const baseUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  business_name: 'Test Business'
};

export const baseClient = {
  id: 1,
  user_id: baseUser.id,
  name: 'Acme Corporation',
  email: 'billing@acme.com'
};
```

### Factories

**Purpose**: Generate test data with variations

**Strategy**:
- Create factory functions for each entity
- Support overrides for specific fields
- Generate realistic data
- Ensure data consistency

**Example**:
```typescript
export function createClient(overrides?: Partial<Client>): Client {
  return {
    id: faker.number.int(),
    user_id: baseUser.id,
    name: faker.company.name(),
    email: faker.internet.email(),
    ...overrides
  };
}
```

### Database Seeding

**Purpose**: Populate test database with realistic data

**Strategy**:
- Seed before integration tests
- Use transactions for isolation
- Clean up after each test
- Maintain referential integrity

**Seed Data**:
- 5 test users
- 20 clients per user
- 10 projects per client
- 30 documents per user
- 15 payments per user
- 50 expenses per user

## Mocking Strategy

### When to Mock

**Always Mock**:
- External APIs (email, storage, PDF generation)
- Time-dependent functions (Date.now())
- Random number generation
- File system operations

**Sometimes Mock**:
- Database (mock for unit tests, real for integration)
- Authentication (mock for unit tests, real for integration)

**Never Mock**:
- Business logic
- Validation rules
- Calculations

### Mock Implementations

**Supabase Client**:
```typescript
export function createMockSupabaseClient() {
  return {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null })
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null })
    }
  };
}
```

**Email Service**:
```typescript
export function createMockEmailService() {
  return {
    send: jest.fn().mockResolvedValue({ success: true }),
    sendTemplate: jest.fn().mockResolvedValue({ success: true })
  };
}
```

## Test Execution

### Local Development

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- client.service.test.ts
```

### CI/CD Pipeline

**On Pull Request**:
1. Run linting
2. Run type checking
3. Run unit tests
4. Run integration tests
5. Generate coverage report
6. Fail if coverage < 80%

**On Merge to Main**:
1. Run all tests
2. Run E2E tests
3. Generate coverage report
4. Deploy to staging
5. Run smoke tests

### Performance Benchmarks

| Test Type | Target Time | Max Time |
|-----------|-------------|----------|
| Unit Test | < 1ms | 10ms |
| Integration Test | < 100ms | 500ms |
| E2E Test | < 5s | 30s |
| Full Suite | < 2min | 5min |

## Test Naming Convention

### Pattern

```typescript
describe('[ComponentName]', () => {
  describe('[methodName]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test implementation
    });
    
    it('should throw [ErrorType] when [invalid condition]', () => {
      // Test implementation
    });
  });
});
```

### Examples

**Good**:
- `should create a new client when valid data is provided`
- `should throw ValidationError when email is invalid`
- `should return 404 when client does not exist`
- `should enforce RLS when user tries to access another user's data`
- `should calculate tax correctly when tax rate is provided`

**Bad**:
- `test client creation` (not descriptive)
- `it works` (too vague)
- `should not fail` (negative assertion)

## Setup and Teardown

### Global Setup (setup.ts)

```typescript
import { beforeAll, afterAll } from 'vitest';
import { setupTestDatabase } from './utils/test-db';
import { setupTestServer } from './utils/test-server';

beforeAll(async () => {
  // Set up test database
  await setupTestDatabase();
  
  // Set up test server
  await setupTestServer();
  
  // Set environment variables
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Close database connections
  await closeTestDatabase();
  
  // Close test server
  await closeTestServer();
});
```

### Per-Test Setup

```typescript
import { beforeEach, afterEach } from 'vitest';

beforeEach(async () => {
  // Reset database state
  await resetDatabase();
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Seed test data
  await seedTestData();
});

afterEach(async () => {
  // Clean up test data
  await cleanupTestData();
});
```

## Error Testing

### Error Scenarios to Test

1. **Validation Errors (400)**
   - Missing required fields
   - Invalid data types
   - Format violations
   - Range violations

2. **Authentication Errors (401)**
   - Missing token
   - Invalid token
   - Expired token
   - Malformed token

3. **Authorization Errors (403)**
   - Insufficient permissions
   - Cross-tenant access attempts
   - RLS violations

4. **Not Found Errors (404)**
   - Non-existent resources
   - Deleted resources
   - Archived resources

5. **Conflict Errors (409)**
   - Duplicate resources
   - Constraint violations
   - Concurrent modifications

6. **Business Logic Errors (422)**
   - Invalid state transitions
   - Business rule violations
   - Calculation errors

7. **Rate Limit Errors (429)**
   - Exceeded request limits
   - Throttling

8. **Server Errors (500)**
   - Database errors
   - Unexpected exceptions
   - Service unavailability

### Error Testing Pattern

```typescript
describe('error handling', () => {
  it('should return 400 when required field is missing', async () => {
    const response = await request(app)
      .post('/clients')
      .send({ email: 'test@example.com' }); // missing name
    
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      type: 'https://api.booklite.app/errors/validation-error',
      title: 'Validation Error',
      status: 400,
      errors: [
        {
          field: 'name',
          message: 'Name is required',
          code: 'REQUIRED_FIELD'
        }
      ]
    });
  });
});
```

## Edge Cases

### Common Edge Cases to Test

1. **Boundary Values**
   - Minimum/maximum lengths
   - Zero values
   - Negative values
   - Very large numbers

2. **Empty States**
   - Empty arrays
   - Empty strings
   - Null values
   - Undefined values

3. **Special Characters**
   - Unicode characters
   - Emojis
   - SQL injection attempts
   - XSS attempts

4. **Concurrent Operations**
   - Race conditions
   - Optimistic locking
   - Transaction isolation

5. **Time-Related**
   - Timezone handling
   - Daylight saving time
   - Leap years
   - Date boundaries

## Continuous Improvement

### Test Maintenance

1. **Regular Review**: Review and update tests quarterly
2. **Refactoring**: Refactor tests when refactoring code
3. **Deprecation**: Remove tests for deprecated features
4. **Documentation**: Keep test documentation up to date

### Metrics to Track

1. **Coverage**: Overall and per-module coverage
2. **Execution Time**: Test suite duration
3. **Flakiness**: Tests that fail intermittently
4. **Maintenance Cost**: Time spent fixing tests

### Quality Gates

**Before Merge**:
- All tests pass
- Coverage ≥ 80%
- No new linting errors
- No type errors

**Before Release**:
- All tests pass
- E2E tests pass
- Performance benchmarks met
- Security scans pass

## Tools and Libraries

### Testing Framework
- **Vitest**: Fast, modern test runner with TypeScript support

### Assertion Library
- **Vitest Expect**: Built-in assertion library

### HTTP Testing
- **Supertest**: HTTP assertion library
- **Fastify Inject**: Built-in testing utility

### Mocking
- **Vitest Mocks**: Built-in mocking utilities
- **MSW**: Mock Service Worker for API mocking

### Test Data
- **Faker.js**: Generate realistic fake data
- **Factory Functions**: Custom data generators

### Coverage
- **c8**: Code coverage tool (built into Vitest)

### E2E Testing
- **Playwright**: Browser automation

## Best Practices

### Do's

✅ Write tests before or alongside code  
✅ Keep tests simple and focused  
✅ Use descriptive test names  
✅ Test one thing per test  
✅ Use fixtures and factories  
✅ Mock external dependencies  
✅ Clean up after tests  
✅ Run tests frequently  
✅ Maintain high coverage  
✅ Document complex test scenarios  

### Don'ts

❌ Don't test implementation details  
❌ Don't write flaky tests  
❌ Don't skip cleanup  
❌ Don't use production data  
❌ Don't test third-party libraries  
❌ Don't ignore failing tests  
❌ Don't write tests that depend on each other  
❌ Don't mock everything  
❌ Don't sacrifice readability for brevity  
❌ Don't forget edge cases  

## Conclusion

This test strategy provides a comprehensive framework for ensuring the quality and reliability of the Booklite API. By following these guidelines, we can maintain high code quality, catch bugs early, and deliver a robust product to our users.

---

**Next Steps**:
1. Review and approve this strategy
2. Implement test infrastructure
3. Write unit tests for service layer
4. Write integration tests for API endpoints
5. Set up CI/CD pipeline
6. Achieve 80%+ coverage
7. Add E2E tests for critical flows

**Related Documents**:
- [Unit Tests Specification](./unit-tests-specification.md)
- [Integration Tests Specification](./integration-tests-specification.md)
- [Test Data Specification](./test-data-specification.md)
- [Test Setup Guide](./test-setup-guide.md)