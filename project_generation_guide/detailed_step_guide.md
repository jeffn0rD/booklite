# Detailed Step-by-Step Guide for AI-Assisted Web Development

This document provides in-depth guidance for each step in the development workflow, using platform-agnostic terminology. Replace `{{PLACEHOLDER}}` variables with your specific technology choices from `project_questionnaire.md`.

* * *

## Phase 1: The Blueprint (Definition)

### Step 1: App Concept & Constraints

#### Purpose

Establish the foundational technology decisions that will guide all subsequent development.

#### Tools Needed

-   **AI Tools:** For tech stack recommendations and comparisons
-   **Decision Frameworks:** Technology evaluation matrices
-   **Comparison Tools:** Stack comparison websites, community surveys
-   **Documentation:** Official framework documentation sites

> **Recommended Tools:** StackShare, GitHub trending, State of \[Language\] surveys, ThoughtWorks Technology Radar

#### Process

1.  **Gather Requirements:**
    -   Target audience (developers, end-users, enterprises)
    -   Performance requirements (real-time, batch processing)
    -   Scale expectations (users, data volume, geographic distribution)
    -   Team expertise and learning curve tolerance
    -   Budget constraints (hosting, licensing)
2.  **Generate Initial Prompt:**
    -   Include all gathered requirements
    -   Specify any existing constraints (must use certain technologies)
    -   Request comparison of 2-3 viable options
3.  **AI Analysis:**
    -   Request pros/cons for each option
    -   Ask for specific use cases where each excels
    -   Get migration/scaling considerations
4.  **Human Review:**
    -   Validate against team capabilities
    -   Check licensing and cost implications
    -   Verify community support and longevity
    -   Consider hiring market if team expansion needed

#### Output Format

```markdown
# Tech Stack Selection

## Application Type
{{PROJECT_TYPE}}

## Frontend
- **Framework:** {{FRONTEND_FRAMEWORK}}
- **Language:** {{FRONTEND_LANGUAGE}}
- **Styling:** {{STYLING_FRAMEWORK}}
- **State Management:** {{STATE_MANAGEMENT}}
- **Build Tool:** {{BUILD_TOOL}}

## Backend
- **Runtime:** {{BACKEND_RUNTIME}}
- **Framework:** {{BACKEND_FRAMEWORK}}
- **Language:** {{BACKEND_LANGUAGE}}
- **ORM:** {{ORM_TOOL}}

## Database
- **Primary:** {{DATABASE_SYSTEM}}
- **Caching:** {{CACHING_SYSTEM}}

## Authentication
- **Method:** {{AUTHENTICATION_METHOD}}
- **Library:** {{AUTH_LIBRARY}}

## Deployment
- **Frontend:** {{FRONTEND_HOSTING}}
- **Backend:** {{BACKEND_HOSTING}}
- **Database:** {{DATABASE_HOSTING}}

## Rationale
[Brief explanation of why each choice was made]
```

* * *

### Step 2: Functional Specification

#### Purpose

Create a comprehensive document that defines what the application does from a user perspective.

#### Tools Needed

-   **AI Tools:** For generating user stories and feature descriptions
-   **Diagramming:** Flow diagram tools for user journeys
-   **Templates:** User story templates, acceptance criteria formats
-   **Collaboration:** Documentation platforms for team review

> **Recommended Tools:** Miro, Figma, Excalidraw for diagrams; Notion, Google Docs for collaboration

#### Process

1.  **Feature Brainstorming:**
    -   List all desired features
    -   Categorize by user type
    -   Prioritize using MoSCoW method (Must, Should, Could, Won't)
2.  **User Story Generation:**
    -   Convert features into user stories
    -   Add acceptance criteria for each
    -   Define edge cases and error scenarios
3.  **AI Enhancement:**
    -   Feed feature list to AI for user story generation
    -   Request edge cases and potential issues
    -   Ask for accessibility considerations
4.  **Human Refinement:**
    -   Validate stories against business goals
    -   Ensure completeness and clarity
    -   Remove ambiguity
    -   Add specific metrics for success

#### Output Format

```markdown
# Functional Specification: {{PROJECT_NAME}}

## Executive Summary
{{PROJECT_DESCRIPTION}}

## User Roles
1. **Guest User:** Can browse, cannot save
2. **Registered User:** Full CRUD on own data
3. **Admin:** Manage all users and content

## Features by Priority

### Must Have (MVP)
#### Feature: User Registration
**User Story:** As a new visitor, I want to create an account so that I can save my preferences.

**Acceptance Criteria:**
- [ ] User can register with email and password
- [ ] Email validation is performed
- [ ] Password must meet security requirements
- [ ] Confirmation email is sent
- [ ] User is redirected to dashboard after registration

**Edge Cases:**
- Duplicate email handling
- Email service downtime
- Weak password attempts

#### Feature: [Next Feature]
...

### Should Have (Post-MVP)
...

### Could Have (Future)
...

### Won't Have (Out of Scope)
...

## Non-Functional Requirements
- **Performance:** Page load < 2 seconds
- **Availability:** 99.9% uptime
- **Security:** Industry standard compliance
- **Accessibility:** WCAG 2.1 AA compliance

## Success Metrics
- User registration conversion rate > 15%
- Average session duration > 5 minutes
- Task completion rate > 80%
```

* * *

### Step 3: Data Model (ERD)

#### Purpose

Define all data entities, their attributes, and relationships before any code is written.

#### Tools Needed

-   **Diagramming:** ERD tools, database design tools
-   **AI Tools:** For entity extraction from specifications
-   **Validation:** Database normalization checkers
-   **Reference:** Database design pattern libraries

> **Recommended Tools:** dbdiagram.io, Lucidchart, draw.io, Mermaid for ERD creation

#### Process

1.  **Entity Extraction:**
    -   Review functional specification
    -   Identify all nouns (potential entities)
    -   Group related attributes
    -   Identify relationships
2.  **AI-Assisted Generation:**
    -   Provide functional spec to AI
    -   Request entity list with attributes
    -   Ask for relationship identification
    -   Request normalization suggestions
3.  **Normalization:**
    -   Apply 3NF (Third Normal Form) principles
    -   Identify and resolve many-to-many relationships
    -   Add junction tables where needed
    -   Consider denormalization for performance (document reasons)
4.  **Human Review:**
    -   Validate against business rules
    -   Check for missing entities
    -   Verify relationship cardinality
    -   Add indexes for common queries

#### Output Format

```markdown
# Data Model: {{PROJECT_NAME}}

## Entities Overview
1. User
2. Profile
3. Post
4. Comment
5. Tag
6. PostTag (junction)

## Detailed Entity Definitions

### User
**Purpose:** Store authentication and core user data

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID/INT | PK, NOT NULL | Primary identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| role | ENUM | NOT NULL, DEFAULT 'user' | user, admin |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update |
| last_login | TIMESTAMP | NULL | Last successful login |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Account status |

**Indexes:**
- email (unique)
- created_at (for sorting)

**Relationships:**
- One-to-One with Profile
- One-to-Many with Post
- One-to-Many with Comment

### Profile
**Purpose:** Store extended user information

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID/INT | PK, NOT NULL | Primary identifier |
| user_id | UUID/INT | FK, UNIQUE, NOT NULL | References User.id |
| display_name | VARCHAR(100) | NULL | Public display name |
| bio | TEXT | NULL | User biography |
| avatar_url | VARCHAR(500) | NULL | Profile picture URL |
| location | VARCHAR(100) | NULL | User location |

**Relationships:**
- One-to-One with User (user_id)

### Post
**Purpose:** Store user-generated content

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID/INT | PK, NOT NULL | Primary identifier |
| user_id | UUID/INT | FK, NOT NULL | References User.id |
| title | VARCHAR(200) | NOT NULL | Post title |
| content | TEXT | NOT NULL | Post body |
| status | ENUM | NOT NULL, DEFAULT 'draft' | draft, published, archived |
| published_at | TIMESTAMP | NULL | Publication timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | View counter |

**Indexes:**
- user_id (for user's posts)
- status (for filtering)
- published_at (for sorting)
- created_at (for sorting)

**Relationships:**
- Many-to-One with User (user_id)
- One-to-Many with Comment
- Many-to-Many with Tag (through PostTag)

## Relationship Diagram
```

\[Use your chosen diagramming tool to create ERD\] Example in Mermaid syntax:

erDiagram User ||--|| Profile : has User ||--o{ Post : creates User ||--o{ Comment : writes Post ||--o{ Comment : has Post }o--o{ Tag : tagged\_with PostTag }o--|| Post : references PostTag }o--|| Tag : references

```

## Business Rules
1. Users must have a unique email
2. Posts can only be edited by their creator or admins
3. Comments cannot be created on archived posts
4. Deleted users have their posts anonymized, not deleted
5. Tags are case-insensitive and normalized to lowercase
```

* * *

### Step 4: Security & Auth Spec

#### Purpose

Define authentication, authorization, and security measures before implementation.

#### Tools Needed

-   **AI Tools:** For security best practice recommendations
-   **Reference:** OWASP guidelines, security framework documentation
-   **Testing:** Security checklist templates
-   **Libraries:** Research authentication libraries for your stack

> **Recommended Tools:** OWASP Cheat Sheets, security header checkers, password strength validators

#### Process

1.  **Authentication Method Selection:**
    -   Session-based vs Token-based
    -   OAuth providers (Google, GitHub, etc.)
    -   Multi-factor authentication needs
    -   Password reset flow
2.  **Authorization Design:**
    -   Role-based access control (RBAC)
    -   Resource-based permissions
    -   API endpoint protection matrix
    -   Frontend route protection
3.  **AI Consultation:**
    -   Request security checklist for chosen stack
    -   Ask for common vulnerabilities in similar apps
    -   Get implementation pattern recommendations
    -   Request rate limiting strategies
4.  **Human Review:**
    -   Validate against compliance requirements (GDPR, HIPAA, etc.)
    -   Check against industry standards
    -   Verify password policies meet requirements
    -   Plan for security audits

#### Output Format

```markdown
# Security & Authentication Specification

## Authentication Method
**Primary:** {{AUTHENTICATION_METHOD}}
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Storage method: [httpOnly cookies / localStorage / sessionStorage]

**Secondary:** {{OAUTH_PROVIDERS}} (if applicable)
- Providers: [List providers]
- Fallback to email/password

## Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Cannot contain username or email
- Check against common password list

## User Roles & Permissions

### Guest (Unauthenticated)
- ✅ View public posts
- ✅ View public profiles
- ❌ Create content
- ❌ Comment
- ❌ Like/save posts

### User (Authenticated)
- ✅ All Guest permissions
- ✅ Create/edit/delete own posts
- ✅ Create/edit/delete own comments
- ✅ Update own profile
- ✅ Like and save posts
- ❌ Moderate content
- ❌ Access admin panel

### Admin
- ✅ All User permissions
- ✅ Delete any post/comment
- ✅ Ban/suspend users
- ✅ View analytics
- ✅ Manage site settings

## API Endpoint Protection

| Endpoint | Method | Auth Required | Roles Allowed |
|----------|--------|---------------|---------------|
| /api/auth/register | POST | No | - |
| /api/auth/login | POST | No | - |
| /api/auth/logout | POST | Yes | All |
| /api/posts | GET | No | - |
| /api/posts | POST | Yes | User, Admin |
| /api/posts/:id | PUT | Yes | Owner, Admin |
| /api/posts/:id | DELETE | Yes | Owner, Admin |
| /api/users/:id | GET | No | - |
| /api/users/:id | PUT | Yes | Owner, Admin |
| /api/admin/* | ALL | Yes | Admin |

## Security Measures

### Input Validation
- Sanitize all user inputs
- Validate data types and formats
- Implement max length constraints
- Use parameterized queries (prevent SQL injection)

### Rate Limiting
- Login attempts: 5 per 15 minutes per IP
- API requests: 100 per minute per user
- Registration: 3 per hour per IP
- Password reset: 3 per hour per email

### Data Protection
- Passwords hashed with bcrypt (cost factor: 12)
- Sensitive data encrypted at rest
- HTTPS enforced for all connections
- CORS configured for specific origins
- CSP headers implemented

### Session Management
- Tokens invalidated on logout
- Refresh token rotation on use
- Concurrent session limit: 5 per user
- Automatic logout after 30 days inactivity

### Audit Logging
- Log all authentication attempts
- Log all authorization failures
- Log all data modifications
- Log all admin actions
- Retain logs for 90 days

## Compliance Considerations
- {{PRIVACY_COMPLIANCE}}: [List applicable regulations]
- Data retention: [Specify retention periods]
- Privacy policy and terms of service required
```

* * *

### Step 5: System Architecture

#### Purpose

Define the high-level structure and component interactions of the system.

#### Tools Needed

-   **Diagramming:** Architecture diagram tools
-   **AI Tools:** For architecture pattern recommendations
-   **Reference:** Architecture pattern catalogs, cloud provider documentation
-   **Templates:** C4 model templates, architecture diagram templates

> **Recommended Tools:** Lucidchart, draw.io, Mermaid, C4 Model tools for architecture diagrams

#### Process

1.  **Architecture Pattern Selection:**
    -   Monolithic vs Microservices
    -   Serverless considerations
    -   Event-driven components
    -   Caching strategy
2.  **Component Identification:**
    -   Frontend application
    -   API gateway/backend
    -   Database layer
    -   External services
    -   Background jobs/workers
3.  **AI Consultation:**
    -   Request architecture recommendations based on scale
    -   Ask for bottleneck identification
    -   Get scaling strategy suggestions
    -   Request disaster recovery patterns
4.  **Human Review:**
    -   Validate against budget constraints
    -   Check team capability to maintain
    -   Verify monitoring and observability
    -   Plan for future growth

#### Output Format

```markdown
# System Architecture: {{PROJECT_NAME}}

## Architecture Pattern
**Chosen Pattern:** [Monolithic / Microservices / Serverless / Hybrid]

**Rationale:**
- Team size: {{TEAM_SIZE}}
- MVP timeline: {{TIMELINE}}
- Expected initial scale: {{EXPECTED_SCALE}}
- [Additional reasoning]

## High-Level Architecture
```

\[Create architecture diagram using your chosen tool\]

Example components:

-   Client (Web Browser)
-   CDN (Static Assets)
-   Load Balancer
-   API Server(s)
-   Cache Layer
-   Database
-   Job Queue
-   Background Worker
-   Object Storage
-   External Services (Email, etc.)

```

## Component Details

### Frontend Application
- **Technology:** {{FRONTEND_FRAMEWORK}}
- **Hosting:** {{FRONTEND_HOSTING}}
- **Build:** Static site generation where possible
- **Assets:** Served via CDN
- **State:** Client-side with {{STATE_MANAGEMENT}}
- **API Communication:** {{API_ARCHITECTURE}}

### API Server
- **Technology:** {{BACKEND_FRAMEWORK}}
- **Hosting:** {{BACKEND_HOSTING}}
- **Load Balancing:** [Describe approach]
- **Scaling:** Horizontal (add more instances)
- **Session:** Stateless (token-based)
- **Logging:** [Logging strategy]

### Database
- **Technology:** {{DATABASE_SYSTEM}}
- **Hosting:** {{DATABASE_HOSTING}}
- **Backup:** Daily automated backups (7-day retention)
- **Replication:** [Describe replication strategy]
- **Connection Pooling:** [Max connections]
- **Migrations:** [Migration tool]

### Cache Layer
- **Technology:** {{CACHING_SYSTEM}}
- **Hosting:** [Hosting location]
- **Purpose:** 
  - Session data (if needed)
  - Frequently accessed data
  - Rate limiting counters
- **Eviction:** LRU (Least Recently Used)
- **TTL:** Varies by data type (5min - 1hour)

### Object Storage
- **Technology:** {{FILE_STORAGE}}
- **Purpose:** User-uploaded files, images, avatars
- **Access:** Pre-signed URLs for uploads
- **CDN:** [CDN configuration]
- **Backup:** [Backup strategy]

### Background Jobs
- **Technology:** {{BACKGROUND_JOB_SYSTEM}}
- **Purpose:**
  - Email sending
  - File processing
  - Report generation
  - Scheduled cleanup tasks
- **Worker:** [Worker configuration]
- **Retry:** 3 attempts with exponential backoff

### External Services
- **Email:** {{EMAIL_SERVICE}}
- **Monitoring:** {{ERROR_TRACKING}}
- **Analytics:** {{ANALYTICS_TOOL}}
- **Logging:** {{LOGGING_SERVICE}}

## Data Flow Examples

### User Registration Flow
```

1.  User submits form → Frontend
2.  Frontend validates → POST /api/auth/register
3.  API validates input
4.  API checks email uniqueness (DB)
5.  API hashes password
6.  API creates user record (DB)
7.  API queues welcome email (Queue)
8.  API returns tokens
9.  Frontend stores tokens
10.  Worker sends welcome email (async)

```

### Content Creation Flow
```

1.  User creates content → Frontend
2.  User uploads media → Frontend
3.  Frontend gets pre-signed URL → API
4.  Frontend uploads media → Object Storage
5.  Frontend submits content data → API
6.  API validates auth token
7.  API validates content data
8.  API creates content record (DB)
9.  API invalidates cache
10.  API returns content data
11.  Frontend updates UI

```

## Scalability Considerations

### Current Capacity
- **Users:** Up to {{EXPECTED_SCALE}} concurrent
- **Requests:** [Requests per second]
- **Storage:** [Storage capacity]

### Scaling Strategy
1. **Phase 1 (Initial):** Current architecture
2. **Phase 2 (Growth):**
   - Add read replicas for database
   - Increase API server instances
   - Implement more aggressive caching
3. **Phase 3 (Scale):**
   - Consider service extraction
   - Implement CDN for API responses
   - Database sharding if needed

## Disaster Recovery

### Backup Strategy
- **Database:** Daily full backup, [retention period]
- **Object Storage:** Cross-region replication
- **Code:** Version control repository
- **Configuration:** Environment variables documented

### Recovery Time Objectives
- **RTO (Recovery Time Objective):** [Time to restore]
- **RPO (Recovery Point Objective):** [Acceptable data loss]

### Incident Response
1. Detect issue (monitoring alerts)
2. Assess impact and severity
3. Communicate to stakeholders
4. Implement fix or rollback
5. Post-mortem documentation

## Security Architecture

### Network Security
- HTTPS enforced (TLS 1.3)
- CORS configured for specific origins
- Rate limiting at API gateway
- DDoS protection via [Provider]

### Application Security
- Input validation and sanitization
- Parameterized queries
- Token validation
- CSRF protection
- Security headers (CSP, X-Frame-Options, etc.)

### Data Security
- Passwords hashed with [Algorithm]
- Sensitive data encrypted at rest
- PII data access logged
- Regular security audits

## Monitoring & Observability

### Metrics to Track
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Cache hit rates
- Queue processing times
- User registration/login rates

### Alerting Rules
- API error rate > 5% for 5 minutes
- Database connection pool exhausted
- Disk space > 80% used
- API response time p95 > 2 seconds
- Queue backlog > 1000 jobs

### Logging Strategy
- Structured JSON logs
- Log levels: ERROR, WARN, INFO, DEBUG
- Correlation IDs for request tracing
- PII data redacted from logs
- [Retention period]
```

* * *

## Phase 2: The Contracts (The "Source of Truth")

### Step 6: Database Schema Generation

#### Purpose

Convert the ERD into executable database schema code that can be version controlled and deployed.

#### Tools Needed

-   **ORM Tools:** Database abstraction layer for your chosen stack
-   **Migration Tools:** Schema versioning tools
-   **AI Tools:** For schema generation from ERD
-   **Validation:** SQL linters, schema validators
-   **Testing:** Database testing frameworks

> **Recommended Tools:** Check `research_resources.md` for ORM options for your {{BACKEND\_LANGUAGE}}

#### Process

1.  **Schema File Generation:**
    -   Convert ERD to ORM schema format
    -   Define all tables, columns, and constraints
    -   Add indexes for performance
    -   Include seed data definitions
2.  **AI-Assisted Conversion:**
    -   Provide ERD to AI
    -   Request schema in specific ORM format
    -   Ask for index recommendations
    -   Get migration script generation
3.  **Migration Strategy:**
    -   Create initial migration
    -   Plan for future schema changes
    -   Define rollback procedures
    -   Test migration on clean database
4.  **Human Review:**
    -   Verify all relationships are correct
    -   Check constraint definitions
    -   Validate index strategy
    -   Test with sample data

#### Output Format

**Schema Definition (Generic Example):**

```
// Schema file for {{ORM_TOOL}}

// User entity
entity User {
  id: primary_key (uuid/integer)
  email: string(255) unique not_null
  password_hash: string(255) not_null
  role: enum(user, admin) default(user)
  is_active: boolean default(true)
  created_at: timestamp default(now())
  updated_at: timestamp default(now())
  last_login: timestamp nullable
  
  // Relationships
  profile: one_to_one(Profile)
  posts: one_to_many(Post)
  comments: one_to_many(Comment)
  
  // Indexes
  index(email)
  index(created_at)
}

// Profile entity
entity Profile {
  id: primary_key (uuid/integer)
  user_id: foreign_key(User.id) unique not_null on_delete(cascade)
  display_name: string(100) nullable
  bio: text nullable
  avatar_url: string(500) nullable
  location: string(100) nullable
  
  // Relationships
  user: belongs_to(User)
}

// Post entity
entity Post {
  id: primary_key (uuid/integer)
  user_id: foreign_key(User.id) not_null on_delete(cascade)
  title: string(200) not_null
  content: text not_null
  status: enum(draft, published, archived) default(draft)
  published_at: timestamp nullable
  created_at: timestamp default(now())
  updated_at: timestamp default(now())
  view_count: integer default(0)
  
  // Relationships
  user: belongs_to(User)
  comments: one_to_many(Comment)
  tags: many_to_many(Tag) through(PostTag)
  
  // Indexes
  index(user_id)
  index(status)
  index(published_at)
  index(created_at)
}

// Additional entities...
```

**Seed Data Script (Pseudocode):**

```
// seed script

import { hash_password } from 'auth_utils'
import { database } from 'database_connection'

async function seed() {
  // Create admin user
  admin = await database.users.create({
    email: 'admin@example.com',
    password_hash: await hash_password('Admin123!'),
    role: 'admin',
    profile: {
      display_name: 'Admin User',
      bio: 'System administrator'
    }
  })

  // Create test user
  user = await database.users.create({
    email: 'user@example.com',
    password_hash: await hash_password('User123!'),
    role: 'user',
    profile: {
      display_name: 'Test User',
      bio: 'Just a regular user'
    }
  })

  // Create tags
  tags = await database.tags.create_many([
    { name: 'Technology', slug: 'technology' },
    { name: 'Tutorial', slug: 'tutorial' },
    { name: 'News', slug: 'news' }
  ])

  // Create sample posts
  post = await database.posts.create({
    user_id: user.id,
    title: 'Getting Started with Web Development',
    content: 'This is a comprehensive guide...',
    status: 'published',
    published_at: now(),
    tags: [tags[0], tags[1]]
  })

  // Create sample comments
  await database.comments.create({
    post_id: post.id,
    user_id: admin.id,
    content: 'Great article! Very helpful.'
  })

  console.log('Seed data created successfully')
}

seed()
```

* * *

### Step 7: API Interface Definition

#### Purpose

Create a machine-readable contract that defines every API endpoint, ensuring frontend and backend alignment.

#### Tools Needed

-   **Specification Tools:** API specification editors
-   **AI Tools:** For endpoint generation from functional spec
-   **Validation:** API specification validators
-   **Documentation:** API documentation generators

> **Recommended Tools:** Swagger Editor, Stoplight Studio, Postman for API design and testing

#### Process

1.  **Endpoint Identification:**
    -   Map user stories to API operations
    -   Define resource-based routes (RESTful pattern)
    -   Identify CRUD operations needed
    -   Plan for pagination, filtering, sorting
2.  **Schema Definition:**
    -   Define request body schemas
    -   Define response schemas
    -   Define error response formats
    -   Add validation rules
3.  **AI-Assisted Generation:**
    -   Provide functional spec and data model
    -   Request API specification generation
    -   Ask for example requests/responses
    -   Get security scheme definitions
4.  **Human Review:**
    -   Verify endpoint naming consistency
    -   Check HTTP method appropriateness
    -   Validate status code usage
    -   Ensure comprehensive error handling

#### Output Format

**API Specification (Generic Format):**

```yaml
api_specification:
  version: "1.0.0"
  title: "{{PROJECT_NAME}} API"
  description: "{{PROJECT_DESCRIPTION}}"
  base_url: "/api/v1"

security_schemes:
  bearer_auth:
    type: "http"
    scheme: "bearer"
    bearer_format: "JWT"

common_responses:
  error_response:
    properties:
      error: string
      message: string
      details: array (optional)

endpoints:
  # Authentication Endpoints
  - path: "/auth/register"
    method: POST
    auth_required: false
    description: "Register a new user"
    request_body:
      email: string (required, format: email)
      password: string (required, min: 8, pattern: [security requirements])
      display_name: string (optional, max: 100)
    responses:
      201:
        description: "User registered successfully"
        body:
          user: User (without password_hash)
          access_token: string
          refresh_token: string
      400:
        description: "Invalid input"
        body: error_response
      409:
        description: "Email already exists"
        body: error_response

  - path: "/auth/login"
    method: POST
    auth_required: false
    description: "Login user"
    request_body:
      email: string (required, format: email)
      password: string (required)
    responses:
      200:
        description: "Login successful"
        body:
          user: User (without password_hash)
          access_token: string
          refresh_token: string
      401:
        description: "Invalid credentials"
        body: error_response

  - path: "/auth/logout"
    method: POST
    auth_required: true
    description: "Logout user"
    responses:
      200:
        description: "Logged out successfully"
        body:
          message: string

  # Post Endpoints
  - path: "/posts"
    method: GET
    auth_required: false
    description: "Get all published posts"
    query_parameters:
      page: integer (default: 1, min: 1)
      limit: integer (default: 20, min: 1, max: 100)
      tag: string (optional, filter by tag slug)
      search: string (optional, search in title and content)
      sort_by: enum(created_at, published_at, view_count) (default: published_at)
      order: enum(asc, desc) (default: desc)
    responses:
      200:
        description: "List of posts"
        body:
          data: array of Post
          meta:
            page: integer
            limit: integer
            total: integer
            total_pages: integer

  - path: "/posts"
    method: POST
    auth_required: true
    roles: [user, admin]
    description: "Create a new post"
    request_body:
      title: string (required, min: 1, max: 200)
      content: string (required, min: 1)
      status: enum(draft, published) (default: draft)
      tag_ids: array of uuid/integer (optional)
    responses:
      201:
        description: "Post created successfully"
        body: Post
      400:
        description: "Invalid input"
        body: error_response
      401:
        description: "Unauthorized"
        body: error_response

  - path: "/posts/{id}"
    method: GET
    auth_required: false
    description: "Get post by ID"
    path_parameters:
      id: uuid/integer (required)
    responses:
      200:
        description: "Post details"
        body: Post (with author and tags)
      404:
        description: "Post not found"
        body: error_response

  - path: "/posts/{id}"
    method: PUT
    auth_required: true
    roles: [owner, admin]
    description: "Update post"
    path_parameters:
      id: uuid/integer (required)
    request_body:
      title: string (optional, min: 1, max: 200)
      content: string (optional, min: 1)
      status: enum(draft, published, archived) (optional)
      tag_ids: array of uuid/integer (optional)
    responses:
      200:
        description: "Post updated successfully"
        body: Post
      400:
        description: "Invalid input"
        body: error_response
      401:
        description: "Unauthorized"
        body: error_response
      403:
        description: "Forbidden - not post owner"
        body: error_response
      404:
        description: "Post not found"
        body: error_response

  - path: "/posts/{id}"
    method: DELETE
    auth_required: true
    roles: [owner, admin]
    description: "Delete post"
    path_parameters:
      id: uuid/integer (required)
    responses:
      204:
        description: "Post deleted successfully"
      401:
        description: "Unauthorized"
        body: error_response
      403:
        description: "Forbidden - not post owner"
        body: error_response
      404:
        description: "Post not found"
        body: error_response

  # Additional endpoints...

data_models:
  User:
    id: uuid/integer
    email: string
    role: enum(user, admin)
    is_active: boolean
    created_at: timestamp
    last_login: timestamp (nullable)
    profile: Profile (optional)

  Profile:
    id: uuid/integer
    user_id: uuid/integer
    display_name: string (nullable)
    bio: string (nullable)
    avatar_url: string (nullable)
    location: string (nullable)

  Post:
    id: uuid/integer
    user_id: uuid/integer
    title: string
    content: string
    status: enum(draft, published, archived)
    published_at: timestamp (nullable)
    created_at: timestamp
    updated_at: timestamp
    view_count: integer
    author: User (optional, nested)
    tags: array of Tag (optional, nested)

  Comment:
    id: uuid/integer
    post_id: uuid/integer
    user_id: uuid/integer
    content: string
    created_at: timestamp
    updated_at: timestamp
    author: User (optional, nested)

  Tag:
    id: uuid/integer
    name: string
    slug: string
```

* * *

### Step 8: Project Scaffold & Config

#### Purpose

Generate the complete project structure with all configuration files needed for development.

#### Tools Needed

-   **Scaffolding:** Project generators for your chosen frameworks
-   **AI Tools:** For project structure generation
-   **Templates:** Boilerplate repositories, starter templates
-   **Linters:** Code quality tools

> **Recommended Tools:** Framework-specific CLI tools, boilerplate generators

#### Process

1.  **Directory Structure Planning:**
    -   Separate frontend and backend (monorepo vs separate repos)
    -   Organize by feature or by type
    -   Plan for shared code/utilities
    -   Define asset organization
2.  **Configuration Files:**
    -   Package managers
    -   Language configuration (TypeScript, etc.)
    -   Linter and formatter configs
    -   Environment variable templates
    -   Container configurations (if applicable)
3.  **AI-Assisted Generation:**
    -   Request project structure for chosen stack
    -   Ask for best practice configurations
    -   Get ignore file recommendations
    -   Request CI/CD pipeline templates
4.  **Human Review:**
    -   Verify all necessary configs are present
    -   Check for security issues (no secrets committed)
    -   Validate build and dev scripts
    -   Test initial setup process

#### Output Format

**Project Structure:**

```
{{PROJECT_NAME}}/
├── .github/                          # CI/CD workflows
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── frontend/                         # Frontend application
│   ├── public/                       # Static assets
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── src/
│   │   ├── api/                      # API client functions
│   │   │   ├── client.js
│   │   │   ├── auth.api.js
│   │   │   └── posts.api.js
│   │   ├── components/               # UI components
│   │   │   ├── common/               # Reusable components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   └── Modal.jsx
│   │   │   ├── layout/               # Layout components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Layout.jsx
│   │   │   └── posts/                # Feature components
│   │   │       ├── PostCard.jsx
│   │   │       ├── PostForm.jsx
│   │   │       └── PostList.jsx
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   └── usePosts.js
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── PostDetail.jsx
│   │   │   └── CreatePost.jsx
│   │   ├── store/                    # State management
│   │   │   ├── authStore.js
│   │   │   └── postsStore.js
│   │   ├── styles/                   # Global styles
│   │   │   ├── globals.css
│   │   │   └── [framework-specific files]
│   │   ├── types/                    # Type definitions
│   │   │   ├── api.types.js
│   │   │   └── models.types.js
│   │   ├── utils/                    # Utility functions
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   ├── App.jsx                   # Root component
│   │   └── main.jsx                  # Entry point
│   ├── .env.example                  # Environment variables template
│   ├── .eslintrc.json                # Linter configuration
│   ├── .prettierrc                   # Formatter configuration
│   ├── index.html                    # HTML entry point
│   ├── [framework-config]            # Framework-specific config
│   ├── package.json                  # Dependencies
│   └── README.md                     # Frontend documentation
├── backend/                          # Backend application
│   ├── src/
│   │   ├── config/                   # Configuration
│   │   │   ├── database.js
│   │   │   └── environment.js
│   │   ├── controllers/              # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── posts.controller.js
│   │   │   └── users.controller.js
│   │   ├── middleware/               # Middleware functions
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── models/                   # Data models (if not using ORM)
│   │   │   └── [ORM generates these]
│   │   ├── routes/                   # Route definitions
│   │   │   ├── auth.routes.js
│   │   │   ├── posts.routes.js
│   │   │   └── index.js
│   │   ├── services/                 # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── email.service.js
│   │   │   └── posts.service.js
│   │   ├── utils/                    # Utility functions
│   │   │   ├── logger.js
│   │   │   └── validators.js
│   │   ├── types/                    # Type definitions
│   │   │   └── [type files]
│   │   ├── app.js                    # App configuration
│   │   └── server.js                 # Server entry point
│   ├── [database-folder]/            # Database files (e.g., prisma/)
│   │   ├── schema.[ext]              # Schema definition
│   │   ├── seed.js                   # Seed data
│   │   └── migrations/               # Migration files
│   ├── tests/                        # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── setup.js
│   ├── .env.example                  # Environment variables template
│   ├── .eslintrc.json                # Linter configuration
│   ├── .prettierrc                   # Formatter configuration
│   ├── [language-config]             # Language-specific config
│   ├── package.json                  # Dependencies
│   └── README.md                     # Backend documentation
├── .gitignore                        # Git ignore patterns
├── .dockerignore                     # Docker ignore patterns
├── docker-compose.yml                # Docker services (if using)
├── README.md                         # Project documentation
└── package.json                      # Root package file (if monorepo)
```

**Key Configuration Files:**

**Environment Variables Template (.env.example):**

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL="[connection string format for {{DATABASE_SYSTEM}}]"

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Service
EMAIL_API_KEY=your-email-service-api-key
FROM_EMAIL=noreply@example.com

# File Storage
STORAGE_ACCESS_KEY=your-storage-access-key
STORAGE_SECRET_KEY=your-storage-secret-key
STORAGE_REGION=us-east-1
STORAGE_BUCKET=your-bucket-name

# Logging
LOG_LEVEL=info

# External Services
[Add other service API keys as needed]
```

**Linter Configuration (.eslintrc.json):**

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "[framework-specific-config]"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

**Formatter Configuration (.prettierrc):**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

**Container Configuration (docker-compose.yml - if using):**

```yaml
version: '3.8'

services:
  database:
    image: [database-image]
    container_name: {{PROJECT_NAME}}_db
    environment:
      [DATABASE_ENV_VARS]
    ports:
      - "[PORT]:[PORT]"
    volumes:
      - db_data:/var/lib/[database]/data
    healthcheck:
      test: ["CMD-SHELL", "[health check command]"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: [cache-image]
    container_name: {{PROJECT_NAME}}_cache
    ports:
      - "[PORT]:[PORT]"
    volumes:
      - cache_data:/data
    healthcheck:
      test: ["CMD", "[health check command]"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: {{PROJECT_NAME}}_backend
    environment:
      NODE_ENV: development
      DATABASE_URL: [connection string]
      [OTHER_ENV_VARS]
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      database:
        condition: service_healthy
      cache:
        condition: service_healthy
    command: [dev command]

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: {{PROJECT_NAME}}_frontend
    environment:
      API_URL: http://localhost:3000/api/v1
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    command: [dev command]

volumes:
  db_data:
  cache_data:
```

* * *

## Phase 3: The Backend (Logic)

### Step 9: Test Spec Generation

#### Purpose

Create comprehensive test suites before writing implementation code (Test-Driven Development).

#### Tools Needed

-   **Testing Frameworks:** Test runners for your language
-   **Assertion Libraries:** Assertion tools
-   **Mocking:** Mocking libraries
-   **API Testing:** HTTP testing libraries
-   **AI Tools:** For test case generation from API spec

> **Recommended Tools:** Check `research_resources.md` for testing frameworks for {{BACKEND\_LANGUAGE}}

#### Process

1.  **Test Strategy Definition:**
    -   Unit tests for services and utilities
    -   Integration tests for API endpoints
    -   E2E tests for critical user flows
    -   Coverage targets (80%+ recommended)
2.  **Test Case Generation:**
    -   Extract test scenarios from API spec
    -   Define happy path tests
    -   Define error case tests
    -   Define edge case tests
3.  **AI-Assisted Generation:**
    -   Provide API spec to AI
    -   Request test cases for each endpoint
    -   Ask for mock data generation
    -   Get test setup/teardown code
4.  **Human Review:**
    -   Verify test coverage is comprehensive
    -   Check for missing edge cases
    -   Validate test data realism
    -   Ensure tests are maintainable

#### Output Format

**Test Structure (Pseudocode):**

```javascript
// tests/integration/auth.test.js

import { test_framework } from '{{UNIT_TEST_FRAMEWORK}}'
import { http_client } from 'http_testing_library'
import { app } from '../../src/app'
import { database } from '../../src/config/database'
import { hash_password } from '../../src/utils/auth'

describe('Authentication API', () => {
  before_all(async () => {
    // Setup test database
    await database.connect()
  })

  after_all(async () => {
    // Cleanup
    await database.users.delete_all()
    await database.disconnect()
  })

  before_each(async () => {
    // Clear users before each test
    await database.users.delete_all()
  })

  describe('POST /api/v1/auth/register', () => {
    const valid_registration = {
      email: 'test@example.com',
      password: 'Test123!@#',
      display_name: 'Test User'
    }

    test('should register a new user with valid data', async () => {
      const response = await http_client
        .post('/api/v1/auth/register')
        .send(valid_registration)
        .expect(201)

      expect(response.body).to_have_property('user')
      expect(response.body).to_have_property('access_token')
      expect(response.body).to_have_property('refresh_token')
      expect(response.body.user.email).to_equal(valid_registration.email)
      expect(response.body.user).not_to_have_property('password_hash')
    })

    test('should create user profile with display_name', async () => {
      await http_client
        .post('/api/v1/auth/register')
        .send(valid_registration)
        .expect(201)

      const user = await database.users.find_one({
        where: { email: valid_registration.email },
        include: { profile: true }
      })

      expect(user).to_be_defined()
      expect(user.profile).to_be_defined()
      expect(user.profile.display_name).to_equal(valid_registration.display_name)
    })

    test('should hash password before storing', async () => {
      await http_client
        .post('/api/v1/auth/register')
        .send(valid_registration)
        .expect(201)

      const user = await database.users.find_one({
        where: { email: valid_registration.email }
      })

      expect(user.password_hash).not_to_equal(valid_registration.password)
      const is_valid = await verify_password(
        valid_registration.password,
        user.password_hash
      )
      expect(is_valid).to_be_true()
    })

    test('should reject registration with existing email', async () => {
      // First registration
      await http_client
        .post('/api/v1/auth/register')
        .send(valid_registration)
        .expect(201)

      // Duplicate registration
      const response = await http_client
        .post('/api/v1/auth/register')
        .send(valid_registration)
        .expect(409)

      expect(response.body.error).to_equal('EMAIL_EXISTS')
    })

    test('should reject registration with invalid email', async () => {
      const response = await http_client
        .post('/api/v1/auth/register')
        .send({
          ...valid_registration,
          email: 'invalid-email'
        })
        .expect(400)

      expect(response.body.error).to_equal('VALIDATION_ERROR')
      expect(response.body.details).to_contain_object_matching({
        field: 'email'
      })
    })

    test('should reject registration with weak password', async () => {
      const response = await http_client
        .post('/api/v1/auth/register')
        .send({
          ...valid_registration,
          password: 'weak'
        })
        .expect(400)

      expect(response.body.error).to_equal('VALIDATION_ERROR')
      expect(response.body.details).to_contain_object_matching({
        field: 'password'
      })
    })

    test('should reject registration with missing required fields', async () => {
      const response = await http_client
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com'
          // missing password
        })
        .expect(400)

      expect(response.body.error).to_equal('VALIDATION_ERROR')
    })
  })

  describe('POST /api/v1/auth/login', () => {
    const user_credentials = {
      email: 'test@example.com',
      password: 'Test123!@#'
    }

    before_each(async () => {
      // Create a test user
      await http_client
        .post('/api/v1/auth/register')
        .send({
          ...user_credentials,
          display_name: 'Test User'
        })
    })

    test('should login with valid credentials', async () => {
      const response = await http_client
        .post('/api/v1/auth/login')
        .send(user_credentials)
        .expect(200)

      expect(response.body).to_have_property('user')
      expect(response.body).to_have_property('access_token')
      expect(response.body).to_have_property('refresh_token')
      expect(response.body.user.email).to_equal(user_credentials.email)
    })

    test('should update last_login timestamp', async () => {
      await http_client
        .post('/api/v1/auth/login')
        .send(user_credentials)
        .expect(200)

      const user = await database.users.find_one({
        where: { email: user_credentials.email }
      })

      expect(user.last_login).to_be_defined()
      expect(user.last_login).to_be_instance_of(Date)
    })

    test('should reject login with incorrect password', async () => {
      const response = await http_client
        .post('/api/v1/auth/login')
        .send({
          ...user_credentials,
          password: 'WrongPassword123!'
        })
        .expect(401)

      expect(response.body.error).to_equal('INVALID_CREDENTIALS')
    })

    test('should reject login with non-existent email', async () => {
      const response = await http_client
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!@#'
        })
        .expect(401)

      expect(response.body.error).to_equal('INVALID_CREDENTIALS')
    })

    test('should reject login for inactive user', async () => {
      // Deactivate user
      await database.users.update({
        where: { email: user_credentials.email },
        data: { is_active: false }
      })

      const response = await http_client
        .post('/api/v1/auth/login')
        .send(user_credentials)
        .expect(403)

      expect(response.body.error).to_equal('ACCOUNT_INACTIVE')
    })

    test('should enforce rate limiting after multiple failed attempts', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await http_client
          .post('/api/v1/auth/login')
          .send({
            ...user_credentials,
            password: 'WrongPassword'
          })
          .expect(401)
      }

      // 6th attempt should be rate limited
      const response = await http_client
        .post('/api/v1/auth/login')
        .send(user_credentials)
        .expect(429)

      expect(response.body.error).to_equal('TOO_MANY_REQUESTS')
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    let access_token

    before_each(async () => {
      // Register and login to get token
      const response = await http_client
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#',
          display_name: 'Test User'
        })

      access_token = response.body.access_token
    })

    test('should logout successfully with valid token', async () => {
      await http_client
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
    })

    test('should reject logout without token', async () => {
      const response = await http_client
        .post('/api/v1/auth/logout')
        .expect(401)

      expect(response.body.error).to_equal('UNAUTHORIZED')
    })

    test('should reject logout with invalid token', async () => {
      const response = await http_client
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.error).to_equal('INVALID_TOKEN')
    })
  })
})
```

**Unit Test Example (Pseudocode):**

```javascript
// tests/unit/auth.service.test.js

import { test_framework } from '{{UNIT_TEST_FRAMEWORK}}'
import { AuthService } from '../../src/services/auth.service'
import { database } from '../../src/config/database'
import { hash_password, verify_password } from '../../src/utils/auth'
import { sign_token, verify_token } from '../../src/utils/jwt'

// Mock dependencies
mock(database)
mock(hash_password)
mock(sign_token)

describe('AuthService', () => {
  let auth_service

  before_each(() => {
    auth_service = new AuthService()
    clear_all_mocks()
  })

  describe('register', () => {
    const mock_user = {
      id: '123',
      email: 'test@example.com',
      password_hash: 'hashed-password',
      role: 'user',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      last_login: null
    }

    test('should create a new user with hashed password', async () => {
      mock(hash_password).to_return('hashed-password')
      mock(database.users.create).to_return(mock_user)

      const result = await auth_service.register({
        email: 'test@example.com',
        password: 'Test123!@#',
        display_name: 'Test User'
      })

      expect(hash_password).to_have_been_called_with('Test123!@#', 12)
      expect(database.users.create).to_have_been_called_with(
        expect_object_containing({
          email: 'test@example.com',
          password_hash: 'hashed-password'
        })
      )
      expect(result).to_equal(mock_user)
    })

    test('should throw error if email already exists', async () => {
      mock(database.users.find_one).to_return(mock_user)

      await expect(
        auth_service.register({
          email: 'test@example.com',
          password: 'Test123!@#'
        })
      ).to_reject_with_error('Email already exists')
    })
  })

  describe('login', () => {
    const mock_user = {
      id: '123',
      email: 'test@example.com',
      password_hash: 'hashed-password',
      role: 'user',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      last_login: null
    }

    test('should return tokens for valid credentials', async () => {
      mock(database.users.find_one).to_return(mock_user)
      mock(verify_password).to_return(true)
      mock(sign_token).to_return('mock-token')

      const result = await auth_service.login({
        email: 'test@example.com',
        password: 'Test123!@#'
      })

      expect(result).to_have_property('access_token')
      expect(result).to_have_property('refresh_token')
      expect(result).to_have_property('user')
    })

    test('should throw error for invalid password', async () => {
      mock(database.users.find_one).to_return(mock_user)
      mock(verify_password).to_return(false)

      await expect(
        auth_service.login({
          email: 'test@example.com',
          password: 'WrongPassword'
        })
      ).to_reject_with_error('Invalid credentials')
    })

    test('should throw error for inactive user', async () => {
      mock(database.users.find_one).to_return({
        ...mock_user,
        is_active: false
      })

      await expect(
        auth_service.login({
          email: 'test@example.com',
          password: 'Test123!@#'
        })
      ).to_reject_with_error('Account is inactive')
    })
  })

  describe('validate_token', () => {
    test('should return decoded token for valid JWT', () => {
      const mock_decoded = { user_id: '123', email: 'test@example.com' }
      mock(verify_token).to_return(mock_decoded)

      const result = auth_service.validate_token('valid-token')

      expect(verify_token).to_have_been_called_with(
        'valid-token',
        process.env.JWT_SECRET
      )
      expect(result).to_equal(mock_decoded)
    })

    test('should throw error for invalid token', () => {
      mock(verify_token).to_throw(new Error('Invalid token'))

      expect(() => auth_service.validate_token('invalid-token'))
        .to_throw_error('Invalid token')
    })
  })
})
```

* * *

### Step 10: CRUD & Logic Implementation

#### Purpose

Implement the backend code that satisfies the test specifications and API contract.

#### Tools Needed

-   **Code Editor:** IDE with language support
-   **AI Tools:** Code generation assistants
-   **Debugging:** Debugger for your runtime
-   **Database Tools:** Database management tools

> **Recommended Tools:** VS Code, Cursor, WebStorm, or your preferred IDE with {{BACKEND\_LANGUAGE}} support

#### Process

1.  **Implementation Order:**
    -   Start with data access layer (repositories/models)
    -   Implement business logic (services)
    -   Create API routes and controllers
    -   Add middleware (auth, validation, error handling)
2.  **AI-Assisted Coding:**
    -   Provide API spec + test files to AI
    -   Request implementation for each endpoint
    -   Ask for error handling patterns
    -   Get validation logic generation
3.  **Code Quality:**
    -   Follow SOLID principles
    -   Implement proper error handling
    -   Add logging for debugging
    -   Document complex logic
4.  **Human Review:**
    -   Verify code matches specifications
    -   Check for security vulnerabilities
    -   Ensure proper error messages
    -   Validate business logic correctness

#### Output Format

**Service Layer (Pseudocode):**

```javascript
// src/services/auth.service.js

import { database } from '../config/database'
import { hash_password, verify_password } from '../utils/auth'
import { sign_token } from '../utils/jwt'
import { logger } from '../utils/logger'
import { AppError } from '../utils/errors'

class AuthService {
  constructor() {
    this.SALT_ROUNDS = 12
    this.ACCESS_TOKEN_EXPIRY = '15m'
    this.REFRESH_TOKEN_EXPIRY = '7d'
  }

  /**
   * Register a new user
   * @param {Object} input - Registration data
   * @param {string} input.email - User email
   * @param {string} input.password - User password
   * @param {string} [input.display_name] - Display name
   * @returns {Promise<Object>} User data with tokens
   */
  async register(input) {
    try {
      // Check if email already exists
      const existing_user = await database.users.find_one({
        where: { email: input.email.toLowerCase() }
      })

      if (existing_user) {
        throw new AppError('Email already exists', 409, 'EMAIL_EXISTS')
      }

      // Hash password
      const password_hash = await hash_password(input.password, this.SALT_ROUNDS)

      // Create user with profile
      const user = await database.users.create({
        data: {
          email: input.email.toLowerCase(),
          password_hash,
          profile: {
            create: {
              display_name: input.display_name || null
            }
          }
        },
        include: {
          profile: true
        }
      })

      logger.info(`User registered: ${user.id}`)

      // Generate tokens
      const tokens = this.generate_tokens({
        user_id: user.id,
        email: user.email,
        role: user.role
      })

      // Remove password hash from response
      const { password_hash: _, ...user_without_password } = user

      return {
        user: user_without_password,
        ...tokens
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Registration error:', error)
      throw new AppError('Registration failed', 500, 'REGISTRATION_ERROR')
    }
  }

  /**
   * Login user
   * @param {Object} input - Login credentials
   * @param {string} input.email - User email
   * @param {string} input.password - User password
   * @returns {Promise<Object>} User data with tokens
   */
  async login(input) {
    try {
      // Find user by email
      const user = await database.users.find_one({
        where: { email: input.email.toLowerCase() },
        include: { profile: true }
      })

      if (!user) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
      }

      // Check if account is active
      if (!user.is_active) {
        throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE')
      }

      // Verify password
      const is_password_valid = await verify_password(
        input.password,
        user.password_hash
      )

      if (!is_password_valid) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
      }

      // Update last login
      await database.users.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      })

      logger.info(`User logged in: ${user.id}`)

      // Generate tokens
      const tokens = this.generate_tokens({
        user_id: user.id,
        email: user.email,
        role: user.role
      })

      // Remove password hash from response
      const { password_hash: _, ...user_without_password } = user

      return {
        user: user_without_password,
        ...tokens
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Login error:', error)
      throw new AppError('Login failed', 500, 'LOGIN_ERROR')
    }
  }

  /**
   * Validate access token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  validate_token(token) {
    try {
      const decoded = verify_token(token, process.env.JWT_SECRET)
      return decoded
    } catch (error) {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN')
    }
  }

  /**
   * Refresh access token
   * @param {string} refresh_token - Refresh token
   * @returns {Promise<Object>} New access token
   */
  async refresh_access_token(refresh_token) {
    try {
      const decoded = verify_token(
        refresh_token,
        process.env.JWT_REFRESH_SECRET
      )

      // Verify user still exists and is active
      const user = await database.users.find_one({
        where: { id: decoded.user_id }
      })

      if (!user || !user.is_active) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN')
      }

      // Generate new access token
      const access_token = sign_token(
        {
          user_id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expires_in: this.ACCESS_TOKEN_EXPIRY }
      )

      return { access_token }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError('Token refresh failed', 401, 'INVALID_TOKEN')
    }
  }

  /**
   * Generate access and refresh tokens
   * @private
   * @param {Object} payload - Token payload
   * @returns {Object} Tokens
   */
  generate_tokens(payload) {
    const access_token = sign_token(
      payload,
      process.env.JWT_SECRET,
      { expires_in: this.ACCESS_TOKEN_EXPIRY }
    )

    const refresh_token = sign_token(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expires_in: this.REFRESH_TOKEN_EXPIRY }
    )

    return { access_token, refresh_token }
  }
}

export { AuthService }
```

**Controller Layer (Pseudocode):**

```javascript
// src/controllers/auth.controller.js

import { AuthService } from '../services/auth.service'
import { validate_register_input, validate_login_input } from '../utils/validators'

const auth_service = new AuthService()

class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      // Validate input
      const validated_input = validate_register_input(req.body)

      // Register user
      const result = await auth_service.register(validated_input)

      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      // Validate input
      const validated_input = validate_login_input(req.body)

      // Login user
      const result = await auth_service.login(validated_input)

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // by removing the tokens. This endpoint can be used for
      // token blacklisting if needed.

      res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const { refresh_token } = req.body

      if (!refresh_token) {
        return res.status(400).json({
          error: 'MISSING_TOKEN',
          message: 'Refresh token is required'
        })
      }

      const result = await auth_service.refresh_access_token(refresh_token)

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}

export { AuthController }
```

**Middleware (Pseudocode):**

```javascript
// src/middleware/auth.middleware.js

import { AuthService } from '../services/auth.service'
import { AppError } from '../utils/errors'

const auth_service = new AuthService()

/**
 * Middleware to verify JWT token
 */
export async function authenticate(req, res, next) {
  try {
    // Get token from header
    const auth_header = req.headers.authorization

    if (!auth_header || !auth_header.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED')
    }

    const token = auth_header.substring(7) // Remove 'Bearer ' prefix

    // Validate token
    const decoded = auth_service.validate_token(token)

    // Attach user info to request
    req.user = decoded

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware to check user role
 */
export function authorize(...allowed_roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'))
    }

    if (!allowed_roles.includes(req.user.role)) {
      return next(
        new AppError('Insufficient permissions', 403, 'FORBIDDEN')
      )
    }

    next()
  }
}
```

**Routes (Pseudocode):**

```javascript
// src/routes/auth.routes.js

import { Router } from '{{BACKEND_FRAMEWORK}}'
import { AuthController } from '../controllers/auth.controller'
import { rate_limiter } from '../middleware/rate-limiter.middleware'

const router = Router()
const auth_controller = new AuthController()

// Apply rate limiting to auth routes
const auth_rate_limiter = rate_limiter({
  window_ms: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 requests per window
})

router.post('/register', auth_controller.register)
router.post('/login', auth_rate_limiter, auth_controller.login)
router.post('/logout', auth_controller.logout)
router.post('/refresh', auth_controller.refresh)

export default router
```

* * *

### Step 11: Backend Verification

#### Purpose

Run tests, fix failures, and ensure all backend functionality works correctly.

#### Tools Needed

-   **Test Runners:** Test execution tools
-   **Coverage Tools:** Code coverage analyzers
-   **CI/CD:** Continuous integration platforms
-   **Debugging:** Debugging tools for your runtime

> **Recommended Tools:** Your chosen {{UNIT\_TEST\_FRAMEWORK}} with coverage reporting

#### Process

1.  **Initial Test Run:**
    -   Run all tests
    -   Generate coverage report
    -   Identify failing tests
    -   Document failures
2.  **Iterative Fixing:**
    -   Fix one failing test at a time
    -   Re-run tests after each fix
    -   Use AI to help debug failures
    -   Refactor code for better testability
3.  **AI-Assisted Debugging:**
    -   Provide test failure output to AI
    -   Request fix suggestions
    -   Ask for alternative implementations
    -   Get refactoring recommendations
4.  **Human Review:**
    -   Verify fixes don't break other tests
    -   Check code quality hasn't degraded
    -   Ensure fixes address root cause
    -   Update tests if specifications changed

#### Process Example

**Running Tests:**

```bash
# Run all tests
[test command for {{UNIT_TEST_FRAMEWORK}}]

# Run tests with coverage
[coverage command]

# Run specific test file
[test command] auth.test.js

# Run tests in watch mode
[watch command]

# Run tests with verbose output
[verbose command]
```

**Debugging Workflow:**

```markdown
1. Test Failure Identified:
   - Test: "should register a new user with valid data"
   - Error: "Expected 201, received 500"
   - Stack trace shows error in auth.service.js

2. Investigation:
   - Check service implementation
   - Review error logs
   - Verify database connection
   - Check environment variables

3. Root Cause:
   - Missing JWT_SECRET in test environment
   - Service fails when trying to sign token

4. Fix:
   - Add JWT_SECRET to test setup
   - Update .env.test file
   - Modify test configuration

5. Verification:
   - Re-run failing test
   - Run full test suite
   - Check coverage hasn't decreased
   - Commit fix with descriptive message
```

**Coverage Report Analysis:**

```
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   87.5  |   82.3   |   90.1  |   88.2  |
 services/             |   92.1  |   88.5   |   95.0  |   93.4  |
  auth.service.js      |   95.2  |   91.7   |  100.0  |   96.1  |
  posts.service.js     |   89.3  |   85.2   |   90.0  |   90.8  |
 controllers/          |   88.7  |   80.1   |   92.3  |   89.5  |
  auth.controller.js   |   91.2  |   83.3   |   95.0  |   92.1  |
  posts.controller.js  |   86.1  |   76.9   |   89.5  |   86.9  |
 middleware/           |   82.3  |   75.8   |   85.0  |   83.1  |
  auth.middleware.js   |   88.9  |   81.2   |   90.0  |   89.7  |
  error.middleware.js  |   75.6  |   70.3   |   80.0  |   76.5  |
```

* * *

## Phase 4: The Frontend (Visuals)

### Step 12: Design System & Global Styles

#### Purpose

Establish consistent visual design before building components.

#### Tools Needed

-   **Design Tools:** UI/UX design software
-   **CSS Frameworks:** Styling libraries (if using)
-   **Color Tools:** Color palette generators
-   **Typography:** Font selection tools
-   **AI Tools:** For design system generation

> **Recommended Tools:** Figma, Adobe XD for design; Coolors for color palettes; Google Fonts for typography

#### Process

1.  **Brand Definition:**
    -   Define color palette (primary, secondary, neutrals)
    -   Choose typography (headings, body, code)
    -   Set spacing scale (4px, 8px, 16px, etc.)
    -   Define border radius values
    -   Choose shadow styles
2.  **Component Styling:**
    -   Button variants (primary, secondary, outline, ghost)
    -   Input field styles
    -   Card styles
    -   Modal/dialog styles
    -   Alert/notification styles
3.  **AI-Assisted Generation:**
    -   Request design system based on brand
    -   Ask for styling framework configuration
    -   Get component style recommendations
    -   Request accessibility considerations
4.  **Human Review:**
    -   Verify brand alignment
    -   Check accessibility (contrast ratios)
    -   Test on different screen sizes
    -   Validate with stakeholders

#### Output Format

**Design System Configuration (Generic Example):**

```javascript
// [styling-config-file] for {{STYLING_FRAMEWORK}}

export default {
  theme: {
    colors: {
      // Primary brand colors
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // Main primary
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554'
      },
      // Secondary/accent colors
      secondary: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef', // Main secondary
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
        950: '#4a044e'
      },
      // Neutral/gray scale
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a'
      },
      // Semantic colors
      success: {
        light: '#d1fae5',
        DEFAULT: '#10b981',
        dark: '#065f46'
      },
      warning: {
        light: '#fef3c7',
        DEFAULT: '#f59e0b',
        dark: '#92400e'
      },
      error: {
        light: '#fee2e2',
        DEFAULT: '#ef4444',
        dark: '#991b1b'
      },
      info: {
        light: '#dbeafe',
        DEFAULT: '#3b82f6',
        dark: '#1e40af'
      }
    },
    typography: {
      font_families: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['Fira Code', 'Consolas', 'monospace']
      },
      font_sizes: {
        xs: ['0.75rem', { line_height: '1rem' }],
        sm: ['0.875rem', { line_height: '1.25rem' }],
        base: ['1rem', { line_height: '1.5rem' }],
        lg: ['1.125rem', { line_height: '1.75rem' }],
        xl: ['1.25rem', { line_height: '1.75rem' }],
        '2xl': ['1.5rem', { line_height: '2rem' }],
        '3xl': ['1.875rem', { line_height: '2.25rem' }],
        '4xl': ['2.25rem', { line_height: '2.5rem' }],
        '5xl': ['3rem', { line_height: '1' }],
        '6xl': ['3.75rem', { line_height: '1' }]
      }
    },
    spacing: {
      0: '0',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem'
    },
    border_radius: {
      none: '0',
      sm: '0.25rem',
      DEFAULT: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
    },
    animations: {
      fade_in: 'fadeIn 0.3s ease-in-out',
      slide_in: 'slideIn 0.3s ease-out',
      bounce_slow: 'bounce 2s infinite'
    }
  }
}
```

**Global Styles (Generic CSS):**

```css
/* src/styles/globals.css */

/* Base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-900);
  line-height: 1.5;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  color: var(--color-neutral-900);
  line-height: 1.2;
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-lg); }
h6 { font-size: var(--font-size-base); }

p {
  font-size: var(--font-size-base);
  color: var(--color-neutral-700);
  margin-bottom: 1rem;
}

a {
  color: var(--color-primary-600);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: var(--color-primary-700);
}

/* Focus styles for accessibility */
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Component classes */
.btn {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary-600);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.btn-secondary {
  background-color: var(--color-secondary-600);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-700);
}

.btn-outline {
  border: 2px solid var(--color-primary-600);
  color: var(--color-primary-600);
  background-color: transparent;
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--color-primary-50);
}

.btn-ghost {
  color: var(--color-neutral-700);
  background-color: transparent;
}

.btn-ghost:hover:not(:disabled) {
  background-color: var(--color-neutral-100);
}

/* Input fields */
.input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Cards */
.card {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

.card-bordered {
  border: 1px solid var(--color-neutral-200);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.badge-primary {
  background-color: var(--color-primary-100);
  color: var(--color-primary-800);
}

.badge-success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.badge-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.badge-error {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alert-info {
  background-color: var(--color-info-light);
  border: 1px solid var(--color-info);
  color: var(--color-info-dark);
}

.alert-success {
  background-color: var(--color-success-light);
  border: 1px solid var(--color-success);
  color: var(--color-success-dark);
}

.alert-warning {
  background-color: var(--color-warning-light);
  border: 1px solid var(--color-warning);
  color: var(--color-warning-dark);
}

.alert-error {
  background-color: var(--color-error-light);
  border: 1px solid var(--color-error);
  color: var(--color-error-dark);
}

/* Loading spinner */
.spinner {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  border: 4px solid var(--color-neutral-200);
  border-top-color: var(--color-primary-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Utility classes */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }

.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }

/* Responsive utilities */
@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
  
  h1 { font-size: var(--font-size-3xl); }
  h2 { font-size: var(--font-size-2xl); }
  h3 { font-size: var(--font-size-xl); }
}
```

* * *

_This document continues with Steps 13-20 following the same platform-agnostic pattern. Each step provides conceptual guidance, process descriptions, and generic output formats that can be adapted to any technology stack._

_For complete implementation details specific to your chosen technologies, refer to:_

-   _`project_questionnaire.md` - Define your technology choices_
-   _`research_resources.md` - Technology-specific documentation_
-   _`prompt_fragments.md` - Customizable prompts for your stack_

* * *

## Using This Guide

1.  **Complete the Questionnaire:** Fill out `project_questionnaire.md` with your technology selections
2.  **Replace Placeholders:** Use find-and-replace to populate `{{VARIABLES}}` with your choices
3.  **Follow the Process:** Work through each step methodically
4.  **Adapt as Needed:** Modify examples to match your specific stack's syntax and conventions
5.  **Maintain Quality:** Always perform human review at each step

This platform-agnostic approach ensures the workflow remains relevant regardless of technology trends and allows teams to choose the best tools for their specific needs.