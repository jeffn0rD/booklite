Generate a complete project structure for:

## Technology Stack

**Frontend**: Astro with Svelte (TypeScript)
**Backend**: Fastify with TypeScript
**Database**: PostgreSQL (Supabase) with Supabase JS Client
**Styling**: Tailwind CSS
**Package Manager**: npm
**Linter**: ESLint + Biome
**Code Formatter**: Prettier + Biome
**Containerization**: Docker
**CI/CD Platform**: GitHub Actions

## Project Context

**Application**: Lightweight bookkeeping for independent consultants (<50 clients)

**Architecture Pattern**: Modular monolith with serverless adjuncts
- Frontend: Astro/Svelte SPA/MPA served statically via Cloudflare Pages
- Backend: Single Fastify app (modular structure) deployed on Railway
- Database: Supabase (PostgreSQL with RLS)
- Background tasks: Serverless/queue-based jobs for PDF/email

**Philosophy**: Minimal UI, high efficiency, shared components, template-driven outputs; single-user (no teams), USD-only initially

**Scale**: Small business focus (<50 clients per user)

## Requirements

### 1. Folder Structure (Organized by Feature)

**Frontend Structure** (Astro/Svelte):
```
frontend/
├── src/
│   ├── features/           # Feature-based organization
│   │   ├── auth/          # Authentication feature
│   │   ├── dashboard/     # Dashboard feature
│   │   ├── clients/       # Client management
│   │   ├── projects/      # Project management
│   │   ├── documents/     # Quotes/Invoices
│   │   ├── payments/      # Payment tracking
│   │   ├── expenses/      # Expense management
│   │   ├── reports/       # Reporting
│   │   └── settings/      # User settings
│   ├── shared/            # Shared components and utilities
│   │   ├── components/    # Reusable UI components
│   │   ├── layouts/       # Page layouts
│   │   ├── utils/         # Utility functions
│   │   ├── hooks/         # Svelte stores/hooks
│   │   ├── types/         # TypeScript types
│   │   └── api/           # API client
│   ├── pages/             # Astro pages (routing)
│   ├── styles/            # Global styles
│   └── env.d.ts           # Environment types
```

**Backend Structure** (Fastify):
```
backend/
├── src/
│   ├── features/          # Feature-based organization
│   │   ├── auth/         # Authentication
│   │   ├── users/        # User management
│   │   ├── clients/      # Client management
│   │   ├── projects/     # Project management
│   │   ├── documents/    # Document management
│   │   ├── payments/     # Payment tracking
│   │   ├── expenses/     # Expense management
│   │   ├── reports/      # Reporting
│   │   └── attachments/  # File management
│   ├── shared/           # Shared modules
│   │   ├── database/     # Database connection
│   │   ├── middleware/   # Fastify middleware
│   │   ├── plugins/      # Fastify plugins
│   │   ├── utils/        # Utility functions
│   │   ├── types/        # TypeScript types
│   │   └── errors/       # Error handling
│   ├── config/           # Configuration
│   └── server.ts         # Server entry point
```

**Monorepo Root Structure**:
```
booklite/
├── frontend/             # Astro/Svelte frontend
├── backend/              # Fastify backend
├── shared/               # Shared types/utilities
├── docs/                 # Documentation
├── specs/                # Specifications
├── sql/                  # Database migrations
├── tools/                # Development tools
└── .github/              # GitHub workflows
```

### 2. Package Configuration Files

**Root package.json** (monorepo):
- Workspaces configuration
- Root-level scripts (dev, build, test, lint, format)
- Shared dependencies
- Husky for git hooks
- Commitlint for commit messages

**Frontend package.json**:
- Astro dependencies
- Svelte dependencies
- Tailwind CSS
- TypeScript
- Vite
- Testing libraries (Vitest, Testing Library)

**Backend package.json**:
- Fastify and plugins
- Supabase JS client
- Zod for validation
- TypeScript
- Testing libraries (Jest, Supertest)
- PDF generation (Puppeteer)
- Email libraries

**Shared package.json**:
- Shared TypeScript types
- Common utilities
- Zod schemas

### 3. TypeScript Configuration

**Root tsconfig.json**:
- Base configuration
- Path aliases
- Strict mode enabled
- ES2022 target

**Frontend tsconfig.json**:
- Extends root config
- Astro-specific settings
- Svelte support
- Path aliases for @features, @shared

**Backend tsconfig.json**:
- Extends root config
- Node.js settings
- Path aliases for @features, @shared
- Decorators enabled

**Shared tsconfig.json**:
- Extends root config
- Declaration files enabled

### 4. Linter and Formatter Configs

**ESLint Configuration** (.eslintrc.json):
- TypeScript support
- Astro plugin
- Svelte plugin
- Prettier integration
- Import sorting
- Accessibility rules

**Biome Configuration** (biome.json):
- Linting rules
- Formatting rules
- Import sorting
- TypeScript support

**Prettier Configuration** (.prettierrc):
- Print width: 100
- Single quotes
- Trailing commas
- Tab width: 2
- Svelte plugin
- Astro plugin

### 5. Environment Variable Templates

**Frontend .env.example**:
```env
# API Configuration
PUBLIC_API_URL=http://localhost:3000/v1
PUBLIC_API_TIMEOUT=30000

# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
PUBLIC_ENABLE_MFA=false
PUBLIC_ENABLE_REPORTS=true

# Analytics (optional)
PUBLIC_ANALYTICS_ID=

# Environment
PUBLIC_ENV=development
```

**Backend .env.example**:
```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
API_VERSION=v1

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:4321
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_GLOBAL=100
RATE_LIMIT_PER_USER=1000
RATE_LIMIT_AUTH=5

# Storage Configuration (Cloudflare R2)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_BUCKET_NAME=booklite-storage
CLOUDFLARE_PUBLIC_URL=https://storage.booklite.app

# Email Configuration
EMAIL_PROVIDER=postmark
POSTMARK_API_KEY=your-postmark-key
EMAIL_FROM=noreply@booklite.app
EMAIL_FROM_NAME=Booklite

# PDF Generation
PDF_SERVICE_URL=http://localhost:3001
PDF_TIMEOUT=30000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring (optional)
SENTRY_DSN=
SENTRY_ENVIRONMENT=development

# Feature Flags
ENABLE_MFA=false
ENABLE_WEBHOOKS=false
```

### 6. Docker Configuration

**Root Dockerfile** (multi-stage):
- Stage 1: Dependencies (base image with Node.js)
- Stage 2: Build frontend
- Stage 3: Build backend
- Stage 4: Production image (minimal)

**docker-compose.yml**:
- Frontend service (Astro dev server)
- Backend service (Fastify)
- PostgreSQL service (local development)
- Redis service (optional, for caching)
- Nginx service (reverse proxy)

**Frontend Dockerfile**:
- Node.js 20 Alpine
- Install dependencies
- Build Astro app
- Serve with static server

**Backend Dockerfile**:
- Node.js 20 Alpine
- Install dependencies
- Build TypeScript
- Run with node

**.dockerignore**:
- node_modules
- dist
- .env
- .git
- coverage
- *.log

### 7. Version Control Ignore Patterns

**Root .gitignore**:
```
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
.astro/
.output/

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp

# Database
*.db
*.sqlite

# Secrets
*.pem
*.key
secrets/
```

**Frontend-specific .gitignore**:
```
# Astro
.astro/

# Build
dist/

# Dependencies
node_modules/
```

**Backend-specific .gitignore**:
```
# Build
dist/

# Dependencies
node_modules/

# Uploads (local development)
uploads/
```

### 8. README with Setup Instructions

**Root README.md** should include:

1. **Project Overview**
   - Description
   - Features
   - Architecture diagram
   - Technology stack

2. **Prerequisites**
   - Node.js 20+
   - npm 10+
   - Docker (optional)
   - Supabase account

3. **Quick Start**
   - Clone repository
   - Install dependencies
   - Set up environment variables
   - Run database migrations
   - Start development servers

4. **Development**
   - Frontend development
   - Backend development
   - Running tests
   - Linting and formatting
   - Database management

5. **Project Structure**
   - Directory organization
   - Feature-based architecture
   - Shared code

6. **Scripts**
   - dev: Start development servers
   - build: Build for production
   - test: Run tests
   - lint: Run linters
   - format: Format code
   - type-check: TypeScript checking

7. **Deployment**
   - Frontend (Cloudflare Pages)
   - Backend (Railway)
   - Environment variables
   - Database migrations

8. **Contributing**
   - Code style
   - Commit conventions
   - Pull request process

9. **License**

### 9. CI/CD Pipeline Configuration (GitHub Actions)

**Workflows**:

1. **.github/workflows/ci.yml** (Continuous Integration):
   - Trigger: Push to any branch, pull requests
   - Jobs:
     - Lint (ESLint, Biome)
     - Type check (TypeScript)
     - Test (Vitest, Jest)
     - Build (Frontend and Backend)
   - Matrix: Node.js versions (20.x)
   - Cache: npm dependencies

2. **.github/workflows/deploy-frontend.yml**:
   - Trigger: Push to main branch
   - Jobs:
     - Build Astro app
     - Deploy to Cloudflare Pages
   - Secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID

3. **.github/workflows/deploy-backend.yml**:
   - Trigger: Push to main branch
   - Jobs:
     - Build Docker image
     - Push to Railway
     - Run database migrations
   - Secrets: RAILWAY_TOKEN, DATABASE_URL

4. **.github/workflows/test.yml**:
   - Trigger: Pull requests
   - Jobs:
     - Unit tests
     - Integration tests
     - E2E tests (Playwright)
     - Coverage report

5. **.github/workflows/release.yml**:
   - Trigger: Tag push (v*)
   - Jobs:
     - Create GitHub release
     - Generate changelog
     - Build and publish artifacts

## Additional Requirements

### Feature Module Structure

Each feature module should follow this pattern:

```
features/[feature-name]/
├── components/        # Feature-specific components
├── hooks/            # Feature-specific hooks/stores
├── utils/            # Feature-specific utilities
├── types/            # Feature-specific types
├── api/              # API client methods
├── routes/           # API routes (backend)
├── services/         # Business logic (backend)
├── schemas/          # Validation schemas
└── index.ts          # Public API
```

### Shared Module Organization

```
shared/
├── components/       # Reusable UI components
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   └── ...
├── layouts/          # Page layouts
│   ├── MainLayout.astro
│   ├── AuthLayout.astro
│   └── ...
├── utils/            # Utility functions
│   ├── format.ts
│   ├── validation.ts
│   └── ...
├── hooks/            # Shared hooks/stores
├── types/            # Shared TypeScript types
└── api/              # API client base
```

### Testing Structure

```
tests/
├── unit/             # Unit tests
├── integration/      # Integration tests
├── e2e/              # End-to-end tests
├── fixtures/         # Test fixtures
├── mocks/            # Mock data
└── utils/            # Test utilities
```

### Documentation Structure

```
docs/
├── architecture/     # Architecture documentation
├── api/              # API documentation
├── features/         # Feature documentation
├── deployment/       # Deployment guides
└── development/      # Development guides
```

## Output Format

Generate the complete project structure as:

1. **Directory tree** (text format showing all folders and key files)
2. **Configuration files** (complete content for each config file)
3. **Package.json files** (complete with all dependencies and scripts)
4. **README.md** (comprehensive setup and development guide)
5. **Docker files** (Dockerfile, docker-compose.yml)
6. **GitHub Actions workflows** (all .yml files)
7. **Environment templates** (.env.example files)
8. **TypeScript configs** (tsconfig.json files)
9. **Linter/formatter configs** (ESLint, Prettier, Biome)
10. **Git ignore patterns** (.gitignore files)

Organize output into markdown files by category:
- `project-structure.md` - Directory tree and organization
- `configuration-files.md` - All configuration files
- `package-configurations.md` - Package.json files
- `docker-setup.md` - Docker and containerization
- `ci-cd-setup.md` - GitHub Actions workflows
- `development-guide.md` - Setup and development instructions

All files should be production-ready and follow best practices for the specified technology stack.