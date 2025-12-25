# Test Database Setup Guide

## Overview

The BookLite backend uses a dual testing approach:
1. **Unit Tests** - Use mocked Supabase client (no real database needed)
2. **Integration Tests** - Use real Supabase instance (requires database setup)

## Quick Start for Unit Tests

Unit tests work out of the box with mocked database. No setup required:

```bash
npm run test:unit
```

## Integration Test Database Setup

### Option 1: Use Local Supabase (Recommended for Development)

1. **Install Supabase CLI**:
   ```bash
   # Using npm
   npm install -g supabase
   
   # Or using homebrew (macOS)
   brew install supabase/tap/supabase
   ```

2. **Start Local Supabase**:
   ```bash
   supabase start
   ```

3. **Run Database Migrations**:
   ```bash
   # Apply the schema
   supabase db push
   
   # Or run SQL files manually
   supabase db reset --file sql/migration_up.sql
   ```

4. **Set Environment Variables**:
   ```bash
   export SUPABASE_URL=http://localhost:54321
   export SUPABASE_ANON_KEY=your-local-anon-key
   export SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
   ```

5. **Run Integration Tests**:
   ```bash
   npm run test:integration
   ```

### Option 2: Use Test Supabase Project

1. **Create Separate Supabase Project**:
   - Go to https://supabase.com
   - Create new project: "booklite-test"

2. **Get Project Credentials**:
   ```bash
   export SUPABASE_URL=https://your-test-project.supabase.co
   export SUPABASE_ANON_KEY=your-test-anon-key
   export SUPABASE_SERVICE_ROLE_KEY=your-test-service-key
   ```

3. **Run Database Schema**:
   ```sql
   -- In Supabase SQL Editor, run:
   -- 01_schema_core.sql
   -- 02_constraints.sql
   -- 03_indexes.sql
   -- 05_rls_policies.sql
   -- 06_seed_data.sql
   ```

4. **Run Tests**:
   ```bash
   npm run test:integration
   ```

### Option 3: Use In-Memory Database (Fastest)

For the fastest test experience, unit tests use completely mocked database:

```bash
# Run only unit tests (no database required)
npm run test:unit

# Run with coverage
npm run test:coverage
```

## Environment Configuration

### Test Environment Variables

Create `.env.test` file:

```env
# Test Environment Configuration
NODE_ENV=test
LOG_LEVEL=silent
JWT_SECRET=test-jwt-secret-key-32-chars-minimum-for-testing

# Supabase Test Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key

# Other test settings
CORS_ORIGIN=http://localhost:4321
SENTRY_DSN=
```

### Test Database Users

Tests use predefined user IDs:

```javascript
export const TEST_USER_IDS = {
  user1: '550e8400-e29b-41d4-a716-446655440001',
  user2: '550e8400-e29b-41d4-a716-446655440002',
  user3: '550e8400-e29b-41d4-a716-446655440003',
};
```

## Test Data Management

### Seed Data

Test seed data is in `tests/fixtures/`:
- `clients.ts` - Client test data
- `documents.ts` - Document test data
- `projects.ts` - Project test data
- `categories.ts` - Category test data

### Cleanup

Tests automatically clean up:
- `beforeEach()` - Reset mocks
- `afterEach()` - Clean test resources
- `afterAll()` - Final database cleanup

## Mock vs Real Database

### Unit Tests (Mocked)
- ✅ Fast execution (seconds)
- ✅ No external dependencies
- ✅ Predictable results
- ❌ Doesn't test real database interactions

### Integration Tests (Real Database)
- ✅ Tests actual database operations
- ✅ Validates SQL queries
- ✅ Tests RLS policies
- ❌ Slower execution (minutes)
- ❌ Requires database setup

## Recommended Testing Workflow

### 1. Development Phase
```bash
# Fast iteration with unit tests
npm run test:unit -- --watch
```

### 2. Before Commit
```bash
# Run full test suite
npm test
```

### 3. CI/CD Pipeline
```bash
# Run all tests with coverage
npm run test:coverage
```

## Troubleshooting

### Common Issues

**"Missing or invalid environment variables"**
```bash
# Set test environment
export NODE_ENV=test
export JWT_SECRET=test-jwt-secret-key-32-chars-minimum-for-testing
```

**"Database connection failed"**
```bash
# Check Supabase is running
supabase status

# Reset database
supabase db reset
```

**"Permission denied" errors**
```bash
# Check RLS policies are applied
supabase db push
```

**"Test data not found" errors**
```bash
# Run seed data
supabase db reset --file sql/06_seed_data.sql
```

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm test
```

Run specific test file:
```bash
npx vitest run tests/unit/services/client.service.test.ts
```

Run with coverage for specific file:
```bash
npx vitest run --coverage tests/unit/services/client.service.test.ts
```

## Performance Tips

### 1. Use Unit Tests During Development
- Faster feedback loop
- No database overhead
- Can run in watch mode

### 2. Use Integration Tests Sparingly
- Run before commits
- Run in CI/CD
- Use for critical paths only

### 3. Optimize Database Cleanup
- Use transactions for rollback
- Clean up in batches
- Use temporary schemas

## Security Considerations

### Test Data Privacy
- Never use real production data
- Use anonymized test data
- Clean up test credentials

### Test Environment Isolation
- Separate test database
- Different API keys
- Isolated test users

---

This setup ensures your tests are reliable, fast, and maintain proper isolation from production data.