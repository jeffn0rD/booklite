# Project Technology Questionnaire

## Instructions

This questionnaire collects all technology-specific decisions for your project. Complete this form at the start of each project or iteration. Your answers will populate the placeholders in the platform-agnostic documentation.

**How to Use:**

1.  Answer all questions in the sections below
2.  Save this completed questionnaire with your project (e.g., `project_questionnaire_completed.md`)
3.  Use the answers to replace placeholders ({{VARIABLE\_NAME}}) in the workflow documents
4.  Reference this document throughout development for consistency

* * *

## Section 1: Project Basics

### 1.1 Project Identity

**{{PROJECT\_NAME}}**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

> The name of your application

**{{PROJECT\_DESCRIPTION}}**:

> Brief description (2-3 sentences) of what your application does

```
[Your description here]
```

**{{PROJECT\_TYPE}}**:

-   [ ]  Web Application
-   [ ]  Mobile Application
-   [ ]  Desktop Application
-   [ ]  API/Backend Service
-   [ ]  Full-Stack Application
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{TARGET\_USERS}}**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

> Who will use this application? (e.g., "General public", "Enterprise users", "Developers")

**{{EXPECTED\_SCALE}}**:

-   [ ]  Small (< 1,000 users)
-   [ ]  Medium (1,000 - 100,000 users)
-   [ ]  Large (100,000 - 1M users)
-   [ ]  Enterprise (1M+ users)

**{{TIMELINE}}**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

> Expected development timeline (e.g., "3 months to MVP")

**{{TEAM\_SIZE}}**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

> Number of developers on the team

* * *

## Section 2: Frontend Technology Stack

### 2.1 Core Frontend

**{{FRONTEND\_FRAMEWORK}}**:

-   [ ]  React
-   [ ]  Vue.js
-   [ ]  Angular
-   [ ]  Svelte
-   [ ]  Solid.js
-   [ ]  Next.js (React-based)
-   [ ]  Nuxt.js (Vue-based)
-   [ ]  Vanilla JavaScript
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{FRONTEND\_LANGUAGE}}**:

-   [ ]  JavaScript
-   [ ]  TypeScript
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{BUILD\_TOOL}}**:

-   [ ]  Vite
-   [ ]  Webpack
-   [ ]  Parcel
-   [ ]  esbuild
-   [ ]  Rollup
-   [ ]  Framework default
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 2.2 Styling

**{{STYLING\_FRAMEWORK}}**:

-   [ ]  Tailwind CSS
-   [ ]  Bootstrap
-   [ ]  Material-UI (MUI)
-   [ ]  Chakra UI
-   [ ]  Ant Design
-   [ ]  shadcn/ui
-   [ ]  Custom CSS
-   [ ]  CSS Modules
-   [ ]  Styled Components
-   [ ]  Emotion
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{CSS\_PREPROCESSOR}}** (if applicable):

-   [ ]  None
-   [ ]  Sass/SCSS
-   [ ]  Less
-   [ ]  PostCSS
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 2.3 State Management

**{{STATE\_MANAGEMENT}}**:

-   [ ]  React Context API
-   [ ]  Redux Toolkit
-   [ ]  Zustand
-   [ ]  Jotai
-   [ ]  Recoil
-   [ ]  MobX
-   [ ]  XState
-   [ ]  Pinia (Vue)
-   [ ]  Vuex (Vue)
-   [ ]  NgRx (Angular)
-   [ ]  None (component state only)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 2.4 Data Fetching

**{{DATA\_FETCHING\_LIBRARY}}**:

-   [ ]  Native Fetch API
-   [ ]  Axios
-   [ ]  React Query (TanStack Query)
-   [ ]  SWR
-   [ ]  RTK Query
-   [ ]  Apollo Client (GraphQL)
-   [ ]  urql (GraphQL)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 3: Backend Technology Stack

### 3.1 Core Backend

**{{BACKEND\_RUNTIME}}**:

-   [ ]  Node.js
-   [ ]  Deno
-   [ ]  Bun
-   [ ]  Python
-   [ ]  Ruby
-   [ ]  Java
-   [ ]  Go
-   [ ]  Rust
-   [ ]  PHP
-   [ ]  .NET/C#
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{BACKEND\_FRAMEWORK}}**:

-   [ ]  Express.js (Node)
-   [ ]  Fastify (Node)
-   [ ]  NestJS (Node)
-   [ ]  Hono (Node/Deno/Bun)
-   [ ]  FastAPI (Python)
-   [ ]  Django (Python)
-   [ ]  Flask (Python)
-   [ ]  Ruby on Rails (Ruby)
-   [ ]  Spring Boot (Java)
-   [ ]  Gin (Go)
-   [ ]  Actix (Rust)
-   [ ]  Laravel (PHP)
-   [ ]  ASP.NET Core (C#)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{BACKEND\_LANGUAGE}}**:

-   [ ]  JavaScript
-   [ ]  TypeScript
-   [ ]  Python
-   [ ]  Ruby
-   [ ]  Java
-   [ ]  Go
-   [ ]  Rust
-   [ ]  PHP
-   [ ]  C#
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 3.2 API Architecture

**{{API\_ARCHITECTURE}}**:

-   [ ]  REST
-   [ ]  GraphQL
-   [ ]  tRPC
-   [ ]  gRPC
-   [ ]  WebSocket
-   [ ]  Server-Sent Events (SSE)
-   [ ]  Hybrid (specify): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{API\_SPECIFICATION\_FORMAT}}**:

-   [ ]  OpenAPI/Swagger
-   [ ]  GraphQL Schema
-   [ ]  tRPC types
-   [ ]  Custom documentation
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 4: Database & Storage

### 4.1 Primary Database

**{{DATABASE\_SYSTEM}}**:

-   [ ]  PostgreSQL
-   [ ]  MySQL
-   [ ]  MariaDB
-   [ ]  SQLite
-   [ ]  MongoDB
-   [ ]  CouchDB
-   [ ]  Redis (as primary)
-   [ ]  DynamoDB
-   [ ]  Firestore
-   [ ]  Supabase
-   [ ]  PlanetScale
-   [ ]  Neon
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{DATABASE\_TYPE}}**:

-   [ ]  Relational (SQL)
-   [ ]  Document (NoSQL)
-   [ ]  Key-Value
-   [ ]  Graph
-   [ ]  Time-Series
-   [ ]  Multi-model

### 4.2 ORM/Query Builder

**{{ORM\_TOOL}}**:

-   [ ]  Prisma
-   [ ]  TypeORM
-   [ ]  Sequelize
-   [ ]  Drizzle ORM
-   [ ]  Knex.js
-   [ ]  Mongoose (MongoDB)
-   [ ]  SQLAlchemy (Python)
-   [ ]  Django ORM (Python)
-   [ ]  ActiveRecord (Ruby)
-   [ ]  Hibernate (Java)
-   [ ]  GORM (Go)
-   [ ]  Entity Framework (C#)
-   [ ]  Raw SQL queries
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 4.3 Caching

**{{CACHING\_SYSTEM}}**:

-   [ ]  None
-   [ ]  Redis
-   [ ]  Memcached
-   [ ]  In-memory (application-level)
-   [ ]  CDN caching
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 4.4 File Storage

**{{FILE\_STORAGE}}**:

-   [ ]  Local filesystem
-   [ ]  AWS S3
-   [ ]  Google Cloud Storage
-   [ ]  Azure Blob Storage
-   [ ]  Cloudflare R2
-   [ ]  DigitalOcean Spaces
-   [ ]  Supabase Storage
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 5: Authentication & Security

### 5.1 Authentication

**{{AUTHENTICATION\_METHOD}}**:

-   [ ]  JWT (JSON Web Tokens)
-   [ ]  Session-based (cookies)
-   [ ]  OAuth 2.0
-   [ ]  OpenID Connect
-   [ ]  SAML
-   [ ]  Magic Links
-   [ ]  Passwordless (WebAuthn)
-   [ ]  Hybrid approach
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{AUTH\_LIBRARY}}**:

-   [ ]  Custom implementation
-   [ ]  Passport.js
-   [ ]  NextAuth.js
-   [ ]  Auth0
-   [ ]  Firebase Auth
-   [ ]  Supabase Auth
-   [ ]  Clerk
-   [ ]  AWS Cognito
-   [ ]  Keycloak
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{OAUTH\_PROVIDERS}}** (if applicable):

-   [ ]  Google
-   [ ]  GitHub
-   [ ]  Facebook
-   [ ]  Twitter/X
-   [ ]  LinkedIn
-   [ ]  Microsoft
-   [ ]  Apple
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 5.2 Authorization

**{{AUTHORIZATION\_PATTERN}}**:

-   [ ]  Role-Based Access Control (RBAC)
-   [ ]  Attribute-Based Access Control (ABAC)
-   [ ]  Permission-Based
-   [ ]  Custom logic
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 6: Testing

### 6.1 Unit Testing

**{{UNIT\_TEST\_FRAMEWORK}}**:

-   [ ]  Jest
-   [ ]  Vitest
-   [ ]  Mocha
-   [ ]  Jasmine
-   [ ]  pytest (Python)
-   [ ]  RSpec (Ruby)
-   [ ]  JUnit (Java)
-   [ ]  Go testing
-   [ ]  xUnit (.NET)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 6.2 Integration Testing

**{{INTEGRATION\_TEST\_TOOL}}**:

-   [ ]  Same as unit testing framework
-   [ ]  Supertest
-   [ ]  Testing Library
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 6.3 End-to-End Testing

**{{E2E\_TEST\_FRAMEWORK}}**:

-   [ ]  Playwright
-   [ ]  Cypress
-   [ ]  Puppeteer
-   [ ]  Selenium
-   [ ]  TestCafe
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 6.4 API Testing

**{{API\_TEST\_TOOL}}**:

-   [ ]  Postman
-   [ ]  Insomnia
-   [ ]  Thunder Client
-   [ ]  REST Client (VS Code)
-   [ ]  curl
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 7: Development Tools

### 7.1 Code Quality

**{{LINTER}}**:

-   [ ]  ESLint
-   [ ]  TSLint
-   [ ]  Pylint
-   [ ]  RuboCop
-   [ ]  golangci-lint
-   [ ]  Clippy (Rust)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{CODE\_FORMATTER}}**:

-   [ ]  Prettier
-   [ ]  Black (Python)
-   [ ]  RuboCop (Ruby)
-   [ ]  gofmt (Go)
-   [ ]  rustfmt (Rust)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{TYPE\_CHECKER}}** (if applicable):

-   [ ]  TypeScript
-   [ ]  Flow
-   [ ]  mypy (Python)
-   [ ]  Sorbet (Ruby)
-   [ ]  Built-in (Go, Rust, Java, etc.)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 7.2 Version Control

**{{VERSION\_CONTROL}}**:

-   [ ]  Git
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{REPOSITORY\_HOST}}**:

-   [ ]  GitHub
-   [ ]  GitLab
-   [ ]  Bitbucket
-   [ ]  Azure DevOps
-   [ ]  Self-hosted
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 7.3 Package Management

**{{PACKAGE\_MANAGER}}**:

-   [ ]  npm
-   [ ]  yarn
-   [ ]  pnpm
-   [ ]  bun
-   [ ]  pip (Python)
-   [ ]  poetry (Python)
-   [ ]  bundler (Ruby)
-   [ ]  Maven (Java)
-   [ ]  Gradle (Java)
-   [ ]  Go modules
-   [ ]  Cargo (Rust)
-   [ ]  Composer (PHP)
-   [ ]  NuGet (.NET)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 8: Deployment & Infrastructure

### 8.1 Hosting

**{{FRONTEND\_HOSTING}}**:

-   [ ]  Vercel
-   [ ]  Netlify
-   [ ]  Cloudflare Pages
-   [ ]  GitHub Pages
-   [ ]  AWS Amplify
-   [ ]  AWS S3 + CloudFront
-   [ ]  Azure Static Web Apps
-   [ ]  Google Cloud Storage
-   [ ]  Same as backend
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{BACKEND\_HOSTING}}**:

-   [ ]  Railway
-   [ ]  Render
-   [ ]  Fly.io
-   [ ]  Heroku
-   [ ]  AWS (EC2, ECS, Lambda)
-   [ ]  Google Cloud (Compute Engine, Cloud Run)
-   [ ]  Azure (App Service, Functions)
-   [ ]  DigitalOcean
-   [ ]  Linode
-   [ ]  Self-hosted/VPS
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{DATABASE\_HOSTING}}**:

-   [ ]  Same provider as backend
-   [ ]  Railway
-   [ ]  Supabase
-   [ ]  PlanetScale
-   [ ]  Neon
-   [ ]  AWS RDS
-   [ ]  Google Cloud SQL
-   [ ]  Azure Database
-   [ ]  MongoDB Atlas
-   [ ]  Self-hosted
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 8.2 Containerization

**{{CONTAINERIZATION}}**:

-   [ ]  Docker
-   [ ]  Podman
-   [ ]  None
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{ORCHESTRATION}}** (if applicable):

-   [ ]  None
-   [ ]  Docker Compose
-   [ ]  Kubernetes
-   [ ]  Docker Swarm
-   [ ]  AWS ECS
-   [ ]  Google Kubernetes Engine
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 8.3 CI/CD

**{{CI\_CD\_PLATFORM}}**:

-   [ ]  GitHub Actions
-   [ ]  GitLab CI
-   [ ]  CircleCI
-   [ ]  Jenkins
-   [ ]  Travis CI
-   [ ]  Azure Pipelines
-   [ ]  AWS CodePipeline
-   [ ]  Vercel (automatic)
-   [ ]  Netlify (automatic)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 8.4 Infrastructure as Code

**{{IAC\_TOOL}}** (if applicable):

-   [ ]  None
-   [ ]  Terraform
-   [ ]  Pulumi
-   [ ]  AWS CloudFormation
-   [ ]  Azure Resource Manager
-   [ ]  Google Cloud Deployment Manager
-   [ ]  Ansible
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 9: Monitoring & Observability

### 9.1 Error Tracking

**{{ERROR\_TRACKING}}**:

-   [ ]  Sentry
-   [ ]  Rollbar
-   [ ]  Bugsnag
-   [ ]  LogRocket
-   [ ]  Datadog
-   [ ]  New Relic
-   [ ]  Application Insights (Azure)
-   [ ]  CloudWatch (AWS)
-   [ ]  Custom logging
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 9.2 Analytics

**{{ANALYTICS\_TOOL}}**:

-   [ ]  Google Analytics
-   [ ]  Plausible
-   [ ]  Fathom
-   [ ]  Mixpanel
-   [ ]  Amplitude
-   [ ]  PostHog
-   [ ]  Custom implementation
-   [ ]  None
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 9.3 Performance Monitoring

**{{PERFORMANCE\_MONITORING}}**:

-   [ ]  Lighthouse CI
-   [ ]  WebPageTest
-   [ ]  New Relic
-   [ ]  Datadog
-   [ ]  Grafana
-   [ ]  Prometheus
-   [ ]  Built-in platform tools
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 9.4 Logging

**{{LOGGING\_SERVICE}}**:

-   [ ]  Console/stdout
-   [ ]  Winston (Node)
-   [ ]  Pino (Node)
-   [ ]  Bunyan (Node)
-   [ ]  Python logging
-   [ ]  Loguru (Python)
-   [ ]  AWS CloudWatch
-   [ ]  Google Cloud Logging
-   [ ]  Azure Monitor
-   [ ]  Datadog
-   [ ]  Logtail
-   [ ]  Papertrail
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 10: Additional Services

### 10.1 Email

**{{EMAIL\_SERVICE}}**:

-   [ ]  SendGrid
-   [ ]  Mailgun
-   [ ]  AWS SES
-   [ ]  Postmark
-   [ ]  Resend
-   [ ]  Nodemailer (self-hosted)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 10.2 Background Jobs

**{{BACKGROUND\_JOB\_SYSTEM}}**:

-   [ ]  None needed
-   [ ]  Bull (Redis-based)
-   [ ]  BullMQ
-   [ ]  Celery (Python)
-   [ ]  Sidekiq (Ruby)
-   [ ]  AWS SQS
-   [ ]  Google Cloud Tasks
-   [ ]  Azure Queue Storage
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 10.3 Search

**{{SEARCH\_ENGINE}}** (if applicable):

-   [ ]  None
-   [ ]  Database full-text search
-   [ ]  Elasticsearch
-   [ ]  Algolia
-   [ ]  Meilisearch
-   [ ]  Typesense
-   [ ]  AWS CloudSearch
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 10.4 CDN

**{{CDN\_PROVIDER}}**:

-   [ ]  Cloudflare
-   [ ]  AWS CloudFront
-   [ ]  Fastly
-   [ ]  Akamai
-   [ ]  Built-in (Vercel, Netlify)
-   [ ]  None
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 11: Development Environment

### 11.1 IDE/Editor

**{{PRIMARY\_IDE}}**:

-   [ ]  Visual Studio Code
-   [ ]  Cursor
-   [ ]  WebStorm
-   [ ]  IntelliJ IDEA
-   [ ]  PyCharm
-   [ ]  RubyMine
-   [ ]  Vim/Neovim
-   [ ]  Emacs
-   [ ]  Sublime Text
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 11.2 AI Coding Assistants

**{{AI\_ASSISTANT}}** (if using):

-   [ ]  None
-   [ ]  GitHub Copilot
-   [ ]  Cursor AI
-   [ ]  Tabnine
-   [ ]  Amazon CodeWhisperer
-   [ ]  Codeium
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 11.3 Local Development

**{{LOCAL\_DEV\_ENVIRONMENT}}**:

-   [ ]  Native installation
-   [ ]  Docker containers
-   [ ]  Dev containers (VS Code)
-   [ ]  Virtual machines
-   [ ]  WSL (Windows Subsystem for Linux)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 12: Documentation

### 12.1 Code Documentation

**{{CODE\_DOCUMENTATION\_TOOL}}**:

-   [ ]  JSDoc
-   [ ]  TypeDoc
-   [ ]  Sphinx (Python)
-   [ ]  YARD (Ruby)
-   [ ]  Javadoc (Java)
-   [ ]  godoc (Go)
-   [ ]  rustdoc (Rust)
-   [ ]  Inline comments only
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 12.2 Project Documentation

**{{PROJECT\_DOCS\_TOOL}}**:

-   [ ]  Markdown files in repo
-   [ ]  Docusaurus
-   [ ]  VitePress
-   [ ]  GitBook
-   [ ]  Notion
-   [ ]  Confluence
-   [ ]  Wiki (GitHub/GitLab)
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 12.3 API Documentation

**{{API\_DOCS\_TOOL}}**:

-   [ ]  Swagger UI
-   [ ]  ReDoc
-   [ ]  Postman
-   [ ]  GraphQL Playground
-   [ ]  GraphiQL
-   [ ]  Stoplight
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 13: Compliance & Standards

### 13.1 Accessibility

**{{ACCESSIBILITY\_STANDARD}}**:

-   [ ]  WCAG 2.1 Level A
-   [ ]  WCAG 2.1 Level AA
-   [ ]  WCAG 2.1 Level AAA
-   [ ]  Section 508
-   [ ]  Custom requirements
-   [ ]  Not applicable

### 13.2 Data Privacy

**{{PRIVACY\_COMPLIANCE}}** (check all that apply):

-   [ ]  GDPR (EU)
-   [ ]  CCPA (California)
-   [ ]  HIPAA (Healthcare)
-   [ ]  SOC 2
-   [ ]  ISO 27001
-   [ ]  PCI DSS (Payment)
-   [ ]  None required
-   [ ]  Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Section 14: Previous Iteration Reference

### 14.1 Existing Project

**Is this a new project or iteration of an existing one?**

-   [ ]  New project (skip to Section 15)
-   [ ]  Iteration/update of existing project

**If iteration, provide:**

**{{PREVIOUS\_PROJECT\_NAME}}**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{PREVIOUS\_VERSION}}**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**{{PREVIOUS\_TECH\_STACK\_SUMMARY}}**:

```
[Briefly describe the previous technology stack]
```

**{{PREVIOUS\_SPEC\_LOCATION}}**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

> Path or URL to previous project specification

**{{MIGRATION\_NOTES}}**:

```
[Any notes about technology changes or migration considerations]
```

* * *

## Section 15: Special Requirements

### 15.1 Performance Requirements

**{{PERFORMANCE\_TARGETS}}**:

```
- Page load time: _______________________________
- API response time: _______________________________
- Concurrent users: _______________________________
- Other: _______________________________
```

### 15.2 Security Requirements

**{{SECURITY\_REQUIREMENTS}}**:

```
[List any specific security requirements, certifications, or standards]
```

### 15.3 Integration Requirements

**{{THIRD\_PARTY\_INTEGRATIONS}}**:

```
[List any third-party services or APIs that need to be integrated]
```

### 15.4 Custom Requirements

**{{CUSTOM\_REQUIREMENTS}}**:

```
[Any other specific requirements not covered above]
```

* * *

## Completion Checklist

Before proceeding with development, ensure:

-   [ ]  All sections are completed
-   [ ]  Technology choices are compatible with each other
-   [ ]  Team has expertise in chosen technologies (or learning plan exists)
-   [ ]  Budget supports chosen hosting/services
-   [ ]  Timeline is realistic for chosen stack
-   [ ]  All stakeholders have reviewed and approved choices

* * *

## Quick Reference: Placeholder Summary

Use this summary to quickly find and replace placeholders in the platform-agnostic documentation:

### Project Basics

-   `{{PROJECT_NAME}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{PROJECT_DESCRIPTION}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{PROJECT_TYPE}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{TARGET_USERS}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{EXPECTED_SCALE}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Frontend

-   `{{FRONTEND_FRAMEWORK}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{FRONTEND_LANGUAGE}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{STYLING_FRAMEWORK}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{STATE_MANAGEMENT}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{BUILD_TOOL}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Backend

-   `{{BACKEND_RUNTIME}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{BACKEND_FRAMEWORK}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{BACKEND_LANGUAGE}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{API_ARCHITECTURE}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Database

-   `{{DATABASE_SYSTEM}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{ORM_TOOL}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{CACHING_SYSTEM}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Authentication

-   `{{AUTHENTICATION_METHOD}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{AUTH_LIBRARY}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Testing

-   `{{UNIT_TEST_FRAMEWORK}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{E2E_TEST_FRAMEWORK}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Deployment

-   `{{FRONTEND_HOSTING}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{BACKEND_HOSTING}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{CI_CD_PLATFORM}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Tools

-   `{{LINTER}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{CODE_FORMATTER}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{PACKAGE_MANAGER}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   `{{PRIMARY_IDE}}`: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

## Notes

**Date Completed**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Completed By**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Review Date**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Approved By**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* * *

**Next Steps:**

1.  Save this completed questionnaire
2.  Use answers to populate platform-agnostic documentation
3.  Begin Phase 1 of the development workflow
4.  Refer to `research_resources.md` for technology-specific documentation