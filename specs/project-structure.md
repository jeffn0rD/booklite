# Booklite Project Structure

## Overview

This document defines the complete project structure for the Booklite lightweight bookkeeping application, organized by feature for maintainability and scalability.

## Technology Stack

- **Frontend**: Astro with Svelte (TypeScript)
- **Backend**: Fastify with TypeScript
- **Database**: PostgreSQL (Supabase) with Supabase JS Client
- **Styling**: Tailwind CSS
- **Package Manager**: npm
- **Linter**: ESLint + Biome
- **Code Formatter**: Prettier + Biome
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## Monorepo Structure

```
booklite/
├── frontend/                    # Astro/Svelte frontend application
│   ├── src/
│   │   ├── features/           # Feature-based modules
│   │   │   ├── auth/          # Authentication & authorization
│   │   │   ├── dashboard/     # Dashboard & overview
│   │   │   ├── clients/       # Client management
│   │   │   ├── projects/      # Project management
│   │   │   ├── documents/     # Quotes & invoices
│   │   │   ├── payments/      # Payment tracking
│   │   │   ├── expenses/      # Expense management
│   │   │   ├── reports/       # Reporting & analytics
│   │   │   └── settings/      # User settings & preferences
│   │   ├── shared/            # Shared frontend code
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── layouts/       # Page layouts
│   │   │   ├── utils/         # Utility functions
│   │   │   ├── hooks/         # Svelte stores & hooks
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── api/           # API client & HTTP utilities
│   │   ├── pages/             # Astro pages (file-based routing)
│   │   ├── styles/            # Global styles & Tailwind config
│   │   └── env.d.ts           # Environment type definitions
│   ├── public/                # Static assets
│   ├── tests/                 # Frontend tests
│   ├── astro.config.mjs       # Astro configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── package.json           # Frontend dependencies
│   └── .env.example           # Environment variables template
│
├── backend/                    # Fastify backend API
│   ├── src/
│   │   ├── features/          # Feature-based modules
│   │   │   ├── auth/         # Authentication & sessions
│   │   │   ├── users/        # User management
│   │   │   ├── clients/      # Client management
│   │   │   ├── projects/     # Project management
│   │   │   ├── documents/    # Document management
│   │   │   ├── payments/     # Payment processing
│   │   │   ├── expenses/     # Expense tracking
│   │   │   ├── reports/      # Report generation
│   │   │   └── attachments/  # File upload/download
│   │   ├── shared/           # Shared backend code
│   │   │   ├── database/     # Database connection & utilities
│   │   │   ├── middleware/   # Fastify middleware
│   │   │   ├── plugins/      # Fastify plugins
│   │   │   ├── utils/        # Utility functions
│   │   │   ├── types/        # TypeScript type definitions
│   │   │   └── errors/       # Error handling & custom errors
│   │   ├── config/           # Configuration management
│   │   └── server.ts         # Server entry point
│   ├── tests/                # Backend tests
│   ├── tsconfig.json         # TypeScript configuration
│   ├── package.json          # Backend dependencies
│   └── .env.example          # Environment variables template
│
├── shared/                    # Shared code between frontend & backend
│   ├── types/                # Shared TypeScript types
│   ├── schemas/              # Shared validation schemas (Zod)
│   ├── utils/                # Shared utility functions
│   ├── constants/            # Shared constants
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json          # Shared dependencies
│
├── docs/                      # Documentation
│   ├── architecture/         # Architecture documentation
│   ├── api/                  # API documentation
│   ├── features/             # Feature documentation
│   ├── deployment/           # Deployment guides
│   └── development/          # Development guides
│
├── specs/                     # Specifications (existing)
│   ├── entities.md
│   ├── security-and-authentication-policy.md
│   ├── spec.md
│   ├── lightweight-bookkeeping-system-architecture.md
│   ├── database-implementation.md
│   ├── api-specification.md
│   ├── api-endpoints-reference.md
│   └── api-schemas.md
│
├── sql/                       # Database migrations & seeds (existing)
│   ├── 01_schema_core.sql
│   ├── 02_constraints.sql
│   ├── 03_indexes.sql
│   ├── 04_triggers.sql
│   ├── 05_rls_policies.sql
│   ├── 06_seed_data.sql
│   ├── migration_up.sql
│   ├── migration_down.sql
│   └── README.md
│
├── tools/                     # Development tools (existing)
│   ├── rag/                  # RAG database tools
│   ├── generate-from-template.sh
│   └── WORKFLOW.md
│
├── .github/                   # GitHub configuration
│   ├── workflows/            # GitHub Actions workflows
│   │   ├── ci.yml           # Continuous integration
│   │   ├── deploy-frontend.yml
│   │   ├── deploy-backend.yml
│   │   ├── test.yml
│   │   └── release.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .husky/                    # Git hooks
│   ├── pre-commit           # Run linting before commit
│   └── commit-msg           # Validate commit messages
│
├── docker/                    # Docker configurations
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml         # Docker Compose configuration
├── .dockerignore             # Docker ignore patterns
├── .gitignore                # Git ignore patterns
├── .eslintrc.json            # ESLint configuration
├── .prettierrc               # Prettier configuration
├── biome.json                # Biome configuration
├── tsconfig.json             # Root TypeScript configuration
├── package.json              # Root package.json (workspaces)
├── package-lock.json         # Lock file
├── README.md                 # Project README
└── LICENSE                   # License file
```

## Feature Module Structure

Each feature module follows a consistent structure for both frontend and backend:

### Frontend Feature Module

```
features/[feature-name]/
├── components/              # Feature-specific Svelte components
│   ├── [FeatureName]List.svelte
│   ├── [FeatureName]Form.svelte
│   ├── [FeatureName]Detail.svelte
│   └── index.ts
├── hooks/                   # Feature-specific Svelte stores
│   ├── use[FeatureName].ts
│   └── [featureName]Store.ts
├── utils/                   # Feature-specific utilities
│   ├── [featureName]Utils.ts
│   └── [featureName]Helpers.ts
├── types/                   # Feature-specific types
│   └── [featureName].types.ts
├── api/                     # API client methods
│   └── [featureName]Api.ts
└── index.ts                 # Public API exports
```

### Backend Feature Module

```
features/[feature-name]/
├── routes/                  # API route handlers
│   └── [featureName].routes.ts
├── services/                # Business logic
│   └── [featureName].service.ts
├── schemas/                 # Validation schemas (Zod)
│   └── [featureName].schema.ts
├── types/                   # Feature-specific types
│   └── [featureName].types.ts
├── utils/                   # Feature-specific utilities
│   └── [featureName].utils.ts
└── index.ts                 # Public API exports
```

## Shared Components Structure

### Frontend Shared Components

```
shared/components/
├── ui/                      # Basic UI components
│   ├── Button/
│   │   ├── Button.svelte
│   │   ├── Button.test.ts
│   │   └── index.ts
│   ├── Input/
│   │   ├── Input.svelte
│   │   ├── Input.test.ts
│   │   └── index.ts
│   ├── Modal/
│   ├── Card/
│   ├── Table/
│   ├── Form/
│   └── ...
├── layout/                  # Layout components
│   ├── Header/
│   ├── Sidebar/
│   ├── Footer/
│   └── ...
└── feedback/                # Feedback components
    ├── Toast/
    ├── Alert/
    ├── Loading/
    └── ...
```

### Shared Layouts

```
shared/layouts/
├── MainLayout.astro         # Main application layout
├── AuthLayout.astro         # Authentication pages layout
├── DashboardLayout.astro    # Dashboard layout
├── PrintLayout.astro        # Print-friendly layout
└── ErrorLayout.astro        # Error pages layout
```

## Testing Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/
│   ├── utils/
│   └── services/
├── integration/             # Integration tests
│   ├── api/
│   └── features/
├── e2e/                     # End-to-end tests (Playwright)
│   ├── auth.spec.ts
│   ├── clients.spec.ts
│   ├── documents.spec.ts
│   └── ...
├── fixtures/                # Test fixtures & data
├── mocks/                   # Mock data & services
└── utils/                   # Test utilities & helpers
```

## Configuration Files Location

- **Root level**: Monorepo configuration (package.json, tsconfig.json, .gitignore)
- **Frontend**: Astro, Tailwind, Vite configurations
- **Backend**: Fastify, TypeScript configurations
- **Shared**: TypeScript configuration for shared code

## Environment Variables

### Frontend (.env.example)
- Public API URL
- Supabase configuration (public keys)
- Feature flags
- Analytics configuration

### Backend (.env.example)
- Server configuration (port, host)
- Supabase configuration (service keys)
- Database URL
- JWT secrets
- CORS settings
- Rate limiting
- Storage configuration (Cloudflare R2)
- Email provider settings
- PDF generation service
- Logging configuration
- Monitoring (Sentry)

## Docker Structure

- **frontend.Dockerfile**: Multi-stage build for Astro app
- **backend.Dockerfile**: Multi-stage build for Fastify API
- **docker-compose.yml**: Local development environment
- **nginx.conf**: Reverse proxy configuration

## CI/CD Workflows

1. **ci.yml**: Lint, type-check, test, build
2. **deploy-frontend.yml**: Deploy to Cloudflare Pages
3. **deploy-backend.yml**: Deploy to Railway
4. **test.yml**: Run test suite on PRs
5. **release.yml**: Create releases and changelogs

## Key Principles

### 1. Feature-Based Organization
- Code organized by feature, not by type
- Each feature is self-contained
- Clear boundaries between features
- Shared code in dedicated shared/ directory

### 2. Separation of Concerns
- Frontend: UI and user interactions
- Backend: Business logic and data access
- Shared: Common types and utilities
- Clear API boundaries

### 3. Type Safety
- TypeScript throughout
- Shared types between frontend and backend
- Zod schemas for runtime validation
- Strict TypeScript configuration

### 4. Testing Strategy
- Unit tests for utilities and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Test coverage targets: 80%+

### 5. Code Quality
- ESLint + Biome for linting
- Prettier + Biome for formatting
- Husky for pre-commit hooks
- Conventional commits

### 6. Scalability
- Modular architecture
- Feature-based organization
- Clear separation of concerns
- Easy to add new features

### 7. Developer Experience
- Fast development server
- Hot module replacement
- Type checking
- Automated testing
- Clear documentation

## Existing Implementation

The project already has a partial API implementation in `booklite/api/` that serves as a reference implementation:

```
booklite/api/
├── routes/
│   └── clients.ts          # Client CRUD endpoints (reference)
├── schemas/
│   └── client.ts           # Zod validation schemas (reference)
├── services/
│   └── client.ts           # Business logic layer (reference)
├── middleware/             # Middleware directory (empty)
├── utils/                  # Utilities directory (empty)
└── README.md              # Implementation guide
```

This implementation demonstrates:
- Complete CRUD operations for clients
- Zod schema validation
- Service layer pattern
- Supabase integration
- Error handling
- Authentication middleware usage

### Integration with New Structure

The existing `booklite/api/` code should be viewed as a **reference implementation** that demonstrates the patterns to follow when implementing the full backend structure. When creating the new `backend/` directory:

1. **Use as Template**: The client implementation serves as a template for other features
2. **Keep as Reference**: Maintain `booklite/api/` as documentation/reference
3. **Implement New Structure**: Create `backend/src/features/` following the same patterns
4. **Expand Coverage**: Implement remaining features (projects, documents, payments, etc.)

### Migration Strategy

When ready to implement the full backend:

1. **Phase 1: Setup Backend Structure**
   - Create `backend/` directory with proper structure
   - Set up TypeScript, Fastify, and dependencies
   - Configure environment and database connection

2. **Phase 2: Migrate Client Feature**
   - Copy patterns from `booklite/api/routes/clients.ts`
   - Adapt to new structure: `backend/src/features/clients/`
   - Add comprehensive tests
   - Update imports and paths

3. **Phase 3: Implement Remaining Features**
   - Use client feature as template
   - Implement projects, documents, payments, expenses, etc.
   - Follow same patterns for consistency

4. **Phase 4: Shared Code**
   - Extract common patterns to `backend/src/shared/`
   - Create reusable middleware
   - Build utility functions

5. **Phase 5: Testing &amp; Documentation**
   - Add comprehensive test coverage
   - Update API documentation
   - Create deployment guides

### Reference Implementation Benefits

Keeping `booklite/api/` as reference provides:
- **Working Examples**: Demonstrates complete feature implementation
- **Pattern Library**: Shows best practices for routes, schemas, services
- **Quick Reference**: Easy to reference when implementing new features
- **Documentation**: Serves as living documentation of implementation patterns

## Next Steps

1. Create directory structure
2. Set up package.json files
3. Configure TypeScript
4. Set up linting and formatting
5. Create Docker configurations
6. Set up GitHub Actions
7. Write setup documentation
8. Implement features using reference patterns

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Specification - Ready for Implementation