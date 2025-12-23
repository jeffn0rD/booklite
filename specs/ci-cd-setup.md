# CI/CD Setup Specification

This document specifies the GitHub Actions workflows for continuous integration and deployment of the Booklite application.

## Overview

The CI/CD pipeline includes:
- Continuous Integration (CI) on all branches
- Automated testing on pull requests
- Deployment to Cloudflare Pages (frontend)
- Deployment to Railway (backend)
- Release automation

## Workflow Architecture

```
┌─────────────────────────────────────────────────────┐
│                  GitHub Actions                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Push/PR → CI Workflow                              │
│    ├── Lint & Format Check                          │
│    ├── Type Check                                   │
│    ├── Unit Tests                                   │
│    └── Build                                        │
│                                                      │
│  PR → Test Workflow                                 │
│    ├── Integration Tests                            │
│    ├── E2E Tests                                    │
│    └── Coverage Report                              │
│                                                      │
│  Push to main → Deploy Frontend                     │
│    ├── Build Astro App                              │
│    └── Deploy to Cloudflare Pages                   │
│                                                      │
│  Push to main → Deploy Backend                      │
│    ├── Build Docker Image                           │
│    ├── Push to Railway                              │
│    └── Run Migrations                               │
│                                                      │
│  Tag (v*) → Release Workflow                        │
│    ├── Create GitHub Release                        │
│    ├── Generate Changelog                           │
│    └── Publish Artifacts                            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Workflow Specifications

### 1. Continuous Integration Workflow

**Location**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: Run Biome
        run: npx @biomejs/biome check .

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

  test:
    name: Test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build frontend
        run: npm run build:frontend

      - name: Build backend
        run: npm run build:backend

      - name: Upload frontend artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-dist
          path: frontend/dist

      - name: Upload backend artifacts
        uses: actions/upload-artifact@v3
        with:
          name: backend-dist
          path: backend/dist
```

---

### 2. Test Workflow

**Location**: `.github/workflows/test.yml`

```yaml
name: Test

on:
  pull_request:
    branches: [main, develop]

jobs:
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: booklite_test
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: booklite_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run migrate:test
        env:
          DATABASE_URL: postgresql://booklite_test:test_password@localhost:5432/booklite_test

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://booklite_test:test_password@localhost:5432/booklite_test
          NODE_ENV: test

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  coverage:
    name: Coverage Report
    runs-on: ubuntu-latest
    needs: [integration-tests, e2e-tests]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: integration,e2e

      - name: Comment PR with coverage
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

### 3. Deploy Frontend Workflow

**Location**: `.github/workflows/deploy-frontend.yml`

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
      - 'shared/**'
      - '.github/workflows/deploy-frontend.yml'

jobs:
  deploy:
    name: Deploy to Cloudflare Pages
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build frontend
        run: npm run build:frontend
        env:
          PUBLIC_API_URL: ${{ secrets.PUBLIC_API_URL }}
          PUBLIC_SUPABASE_URL: ${{ secrets.PUBLIC_SUPABASE_URL }}
          PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PUBLIC_SUPABASE_ANON_KEY }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: booklite
          directory: frontend/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Create deployment status
        uses: chrnorm/deployment-action@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          environment: production
          environment-url: https://booklite.app
```

---

### 4. Deploy Backend Workflow

**Location**: `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - 'shared/**'
      - '.github/workflows/deploy-backend.yml'

jobs:
  deploy:
    name: Deploy to Railway
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        run: railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

      - name: Run database migrations
        run: railway run --service backend npm run migrate:prod
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

      - name: Health check
        run: |
          sleep 30
          curl -f https://api.booklite.app/health || exit 1

      - name: Create deployment status
        uses: chrnorm/deployment-action@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          environment: production
          environment-url: https://api.booklite.app
```

---

### 5. Release Workflow

**Location**: `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build all packages
        run: npm run build

      - name: Generate changelog
        id: changelog
        uses: metcalfc/changelog-generator@v4.1.0
        with:
          myToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.changelog }}
          files: |
            frontend/dist/**
            backend/dist/**
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Notify deployment
        run: |
          echo "Release ${{ github.ref_name }} created successfully"
```

---

## Required Secrets

Configure these secrets in GitHub repository settings:

### Cloudflare Pages
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID

### Railway
- `RAILWAY_TOKEN`: Railway deployment token

### Supabase
- `PUBLIC_SUPABASE_URL`: Supabase project URL (public)
- `PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (public)

### Application
- `PUBLIC_API_URL`: Production API URL

### Optional
- `CODECOV_TOKEN`: Codecov upload token
- `SENTRY_AUTH_TOKEN`: Sentry authentication token

---

## Branch Protection Rules

Configure these rules for the `main` branch:

1. **Require pull request reviews**: 1 approval required
2. **Require status checks**: 
   - CI workflow must pass
   - Test workflow must pass
3. **Require branches to be up to date**: Enabled
4. **Include administrators**: Enabled
5. **Restrict pushes**: Only allow specific users/teams

---

## Deployment Environments

### Production
- **Frontend**: https://booklite.app (Cloudflare Pages)
- **Backend**: https://api.booklite.app (Railway)
- **Branch**: main
- **Auto-deploy**: Enabled

### Staging (Optional)
- **Frontend**: https://staging.booklite.app
- **Backend**: https://api-staging.booklite.app
- **Branch**: develop
- **Auto-deploy**: Enabled

---

## Monitoring and Notifications

### Slack Notifications (Optional)

Add to workflows:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Email Notifications

Configure in GitHub repository settings:
- Notifications → Email notifications
- Enable for: Workflow runs, Deployments

---

## Rollback Procedures

### Frontend Rollback
```bash
# Via Cloudflare Pages dashboard
1. Navigate to Deployments
2. Select previous successful deployment
3. Click "Rollback to this deployment"
```

### Backend Rollback
```bash
# Via Railway CLI
railway rollback --service backend
```

---

## Performance Optimization

### Caching Strategy

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
      */*/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Parallel Jobs

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [20.x]
        os: [ubuntu-latest]
      fail-fast: false
```

---

## Troubleshooting

### Common Issues

1. **Build failures**: Check Node.js version compatibility
2. **Test failures**: Verify environment variables
3. **Deployment failures**: Check secrets configuration
4. **Permission errors**: Verify GitHub token permissions

### Debug Mode

Enable debug logging:

```yaml
- name: Enable debug logging
  run: echo "ACTIONS_STEP_DEBUG=true" >> $GITHUB_ENV
```

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Specification - Ready for Implementation