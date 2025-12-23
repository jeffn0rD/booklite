# Platform-Agnostic Prompt Fragments for AI-Assisted Development

This document contains reusable prompt templates for each phase of the development workflow. Replace `{{PLACEHOLDER}}` variables with your specific technology choices from `project_questionnaire.md`.

* * *

## How to Use These Prompts

1.  **Fill out `project_questionnaire.md`** with your technology selections
2.  **Replace placeholders** in these prompts with your answers
3.  **Customize further** based on your specific requirements
4.  **Iterate** - use AI responses to refine your prompts

**Placeholder Format:** `{{VARIABLE_NAME}}`

* * *

## Phase 1: The Blueprint (Definition)

### Step 1: App Concept & Constraints

```
I'm building a {{PROJECT_TYPE}} that {{PROJECT_DESCRIPTION}}. 

Requirements:
- Target users: {{TARGET_USERS}}
- Expected scale: {{EXPECTED_SCALE}}
- Performance needs: [REAL-TIME / BATCH / STANDARD]
- Team size: {{TEAM_SIZE}}
- Timeline: {{TIMELINE}}
- Budget: [RANGE]

Please recommend a tech stack including:
1. Frontend framework and why
2. Backend framework and why
3. Database technology and why
4. Styling approach and why
5. Deployment platform and why

For each recommendation, explain:
- Pros and cons
- Learning curve
- Community support
- Scalability considerations
- Cost implications
```

### Step 2: Functional Specification

```
Based on this app concept: {{PROJECT_DESCRIPTION}}

Target users: {{TARGET_USERS}}
Expected scale: {{EXPECTED_SCALE}}

Generate a comprehensive functional specification including:

1. User Roles and Permissions
   - Define each role
   - List capabilities per role

2. Core Features (Must Have for MVP)
   - Convert each feature into user stories
   - Format: "As a [role], I want [feature], so that [benefit]"
   - Add acceptance criteria for each story
   - Include edge cases

3. Secondary Features (Post-MVP)
   - List features for future releases
   - Prioritize by value/effort

4. Out of Scope
   - Explicitly list what won't be included

5. Non-Functional Requirements
   - Performance targets
   - Security requirements
   - Accessibility standards

6. Success Metrics
   - How will we measure success?
   - What KPIs matter?
```

### Step 3: Data Model (ERD)

```
Based on this functional specification: [PASTE SPEC]

Create a detailed Entity Relationship Diagram including:

1. Entity Identification
   - List all entities (nouns from the spec)
   - Define primary purpose of each entity

2. Attributes
   - List all attributes for each entity
   - Specify data types appropriate for {{DATABASE_SYSTEM}}
   - Mark required vs optional fields
   - Add validation rules

3. Relationships
   - Define all relationships between entities
   - Specify cardinality (one-to-one, one-to-many, many-to-many)
   - Identify foreign keys
   - Add junction tables for many-to-many

4. Constraints
   - Unique constraints
   - Check constraints
   - Default values

5. Indexes
   - Identify fields that need indexing
   - Explain reasoning for each index

6. Normalization
   - Ensure 3NF compliance
   - Document any intentional denormalization

Output format: Markdown tables with ERD diagram (use Mermaid or your preferred format)
```

### Step 4: Security & Auth Spec

```
For this application: {{PROJECT_DESCRIPTION}}
With these user roles: [PASTE ROLES]
Using: {{AUTHENTICATION_METHOD}}

Design a comprehensive security and authentication specification:

1. Authentication Method
   - Explain token/session lifecycle
   - Define refresh strategy
   - Password policy requirements

2. Password Policy
   - Minimum requirements
   - Validation rules
   - Storage method (hashing algorithm)

3. Authorization Matrix
   - Create a table showing which roles can access which resources
   - Define CRUD permissions per entity per role

4. API Endpoint Protection
   - List all endpoints
   - Mark which require authentication
   - Specify allowed roles per endpoint

5. Security Measures
   - Input validation strategy
   - Rate limiting rules
   - CORS configuration
   - Security headers needed
   - Data encryption requirements

6. Compliance Considerations
   - {{PRIVACY_COMPLIANCE}} requirements
   - Data retention policies
   - Privacy policy needs
```

### Step 5: System Architecture

```
Given:
- Frontend: {{FRONTEND_FRAMEWORK}}
- Backend: {{BACKEND_FRAMEWORK}}
- Database: {{DATABASE_SYSTEM}}
- Expected scale: {{EXPECTED_SCALE}}
- Key features: [LIST KEY FEATURES]
- Budget: [RANGE]

Design a system architecture including:

1. Architecture Pattern
   - Recommend pattern (monolith, microservices, serverless)
   - Justify the choice

2. Component Diagram
   - Identify all major components
   - Show how they interact
   - Include external services

3. Data Flow
   - Describe key user flows
   - Show data movement through system
   - Identify potential bottlenecks

4. Scalability Strategy
   - How will this scale to {{EXPECTED_SCALE}}?
   - What components need horizontal scaling?
   - Caching strategy

5. Infrastructure
   - Hosting recommendations for {{FRONTEND_HOSTING}} and {{BACKEND_HOSTING}}
   - Database hosting approach
   - CDN needs
   - Background job processing

6. Monitoring & Observability
   - What metrics to track
   - Alerting strategy
   - Logging approach

Output: Architecture diagram (Mermaid or similar) + detailed explanation
```

* * *

## Phase 2: The Contracts (Source of Truth)

### Step 6: Database Schema Generation

```
Convert this ERD to {{ORM_TOOL}} schema for {{DATABASE_SYSTEM}}:

[PASTE ERD]

Requirements:
1. Use proper data types for {{DATABASE_SYSTEM}}
2. Include all constraints and validations
3. Add indexes for performance
4. Include timestamps (created_at, updated_at)
5. Add soft delete support where appropriate
6. Generate seed data script with realistic test data

Also provide:
- Migration strategy
- Rollback procedures
- Initial seed data (at least 3 examples per entity)

Use {{BACKEND_LANGUAGE}} syntax for the implementation.
```

### Step 7: API Interface Definition

```
Create an API specification for this application:

Functional Spec: [PASTE SPEC]
Data Model: [PASTE ENTITIES]
Security Spec: [PASTE AUTH DETAILS]
API Architecture: {{API_ARCHITECTURE}}

Requirements:
1. Define all CRUD endpoints for each entity
2. Include request/response schemas
3. Add validation rules
4. Specify authentication requirements
5. Define error responses (400, 401, 403, 404, 500)
6. Add pagination for list endpoints
7. Include filtering and sorting parameters
8. Add example requests and responses

Format: {{API_SPECIFICATION_FORMAT}} with all components defined
```

### Step 8: Project Scaffold & Config

```
Generate a complete project structure for:

Frontend: {{FRONTEND_FRAMEWORK}} with {{FRONTEND_LANGUAGE}}
Backend: {{BACKEND_FRAMEWORK}} with {{BACKEND_LANGUAGE}}
Database: {{DATABASE_SYSTEM}} with {{ORM_TOOL}}
Styling: {{STYLING_FRAMEWORK}}
Package Manager: {{PACKAGE_MANAGER}}

Include:
1. Folder structure (organized by feature)
2. Package configuration files
3. Language configuration (if using TypeScript or similar)
4. Linter ({{LINTER}}) and formatter ({{CODE_FORMATTER}}) configs
5. Environment variable templates (.env.example)
6. Container configs (if using {{CONTAINERIZATION}})
7. Version control ignore patterns
8. README with setup instructions
9. CI/CD pipeline configuration for {{CI_CD_PLATFORM}}

Organize code by feature, not by type (e.g., features/auth/ not controllers/, services/)
```

* * *

## Phase 3: The Backend (Logic)

### Step 9: Test Spec Generation

```
Generate comprehensive test suites for this API:

API Spec: [PASTE SPEC]
Database Schema: [PASTE SCHEMA]
Testing Framework: {{UNIT_TEST_FRAMEWORK}}
Language: {{BACKEND_LANGUAGE}}

Create tests for:
1. Unit Tests
   - Service layer functions
   - Utility functions
   - Validation logic

2. Integration Tests
   - API endpoints (all CRUD operations)
   - Authentication flows
   - Authorization checks
   - Error handling

3. Test Data
   - Fixtures for each entity
   - Mock data generators
   - Database seeding for tests

Requirements:
- Use {{UNIT_TEST_FRAMEWORK}} syntax
- Include setup and teardown
- Test happy paths and error cases
- Test edge cases
- Aim for 80%+ coverage
- Use descriptive test names

Format: Complete test files with all test cases
```

### Step 10: CRUD & Logic Implementation

```
Implement the backend code to pass these tests:

Test Files: [PASTE TEST CODE]
API Spec: [PASTE SPEC]
Database Schema: [PASTE SCHEMA]
Framework: {{BACKEND_FRAMEWORK}}
Language: {{BACKEND_LANGUAGE}}
ORM: {{ORM_TOOL}}

Generate:
1. Service Layer
   - Business logic
   - Data validation
   - Error handling
   - Transaction management

2. Controller Layer
   - Request handling
   - Response formatting
   - Input validation
   - Error propagation

3. Middleware
   - Authentication (using {{AUTHENTICATION_METHOD}})
   - Authorization
   - Request validation
   - Error handling
   - Logging

4. Routes
   - Route definitions
   - Middleware application
   - Controller binding

Requirements:
- Follow SOLID principles
- Add comprehensive error handling
- Include logging for debugging
- Add documentation comments
- Use strict typing (if applicable)
- Handle edge cases
```

### Step 11: Backend Verification

```
I have test failures in my backend:

Test Output: [PASTE TEST RESULTS]
Failing Test: [TEST NAME]
Error Message: [ERROR]
Stack Trace: [TRACE]

Current Implementation: [PASTE CODE]

Framework: {{BACKEND_FRAMEWORK}}
Language: {{BACKEND_LANGUAGE}}
Testing Framework: {{UNIT_TEST_FRAMEWORK}}

Please:
1. Identify the root cause
2. Explain why the test is failing
3. Provide a fix with explanation
4. Explain what the fix does
5. Suggest how to prevent similar issues

Also check for:
- Security vulnerabilities
- Performance issues
- Code quality problems
```

* * *

## Phase 4: The Frontend (Visuals)

### Step 12: Design System & Global Styles

```
Create a design system for this application:

Brand Guidelines:
- Primary color: [COLOR]
- Secondary color: [COLOR]
- Target audience: {{TARGET_USERS}}
- Design style: [MODERN / CLASSIC / MINIMAL / PLAYFUL]

Framework: {{STYLING_FRAMEWORK}}
Frontend Framework: {{FRONTEND_FRAMEWORK}}

Generate:
1. Complete styling configuration
   - Extended color palette (50-950 shades)
   - Typography scale
   - Spacing system
   - Border radius values
   - Shadow styles
   - Animation keyframes

2. Global styles
   - Base styles
   - Component classes (buttons, inputs, cards, badges, alerts)
   - Utility classes
   - Responsive breakpoints

3. Component Style Guide
   - Button variants (primary, secondary, outline, ghost, danger)
   - Input field styles
   - Card styles
   - Modal styles
   - Alert/notification styles

Requirements:
- Ensure WCAG 2.1 AA compliance ({{ACCESSIBILITY_STANDARD}})
- Use semantic color names
- Include dark mode support (if needed)
- Add smooth transitions
- Mobile-first approach
```

### Step 13: Route/Page Structure

```
Based on:
- User Stories: [PASTE STORIES]
- API Routes: [PASTE API ROUTES]
- Frontend Framework: {{FRONTEND_FRAMEWORK}}

Design the frontend routing structure:

1. URL Structure
   - Map each user story to a route
   - Define route parameters
   - Plan nested routes

2. Page Components
   - List all page components needed
   - Define component hierarchy
   - Identify shared layouts

3. Navigation Flow
   - Create a sitemap
   - Define navigation menu structure
   - Plan breadcrumbs

4. Protected Routes
   - Identify routes requiring authentication
   - Define role-based access
   - Plan redirect logic

5. Route Configuration
   - Generate routing configuration for {{FRONTEND_FRAMEWORK}}
   - Include route guards
   - Add loading states

Output: Complete routing configuration with component structure
```

### Step 14: State Management Strategy

```
Design state management for this application:

API Endpoints: [PASTE API SPEC]
Frontend Framework: {{FRONTEND_FRAMEWORK}}
State Library: {{STATE_MANAGEMENT}}
Data Fetching: {{DATA_FETCHING_LIBRARY}}

Define:
1. Global State Structure
   - Authentication state
   - User profile state
   - Application settings
   - UI state (modals, toasts, etc.)

2. API Integration
   - Data fetching patterns
   - Caching strategy
   - Optimistic updates
   - Error handling

3. State Organization
   - Create separate stores/slices for each domain
   - Define actions/mutations
   - Add selectors

4. Async Operations
   - Loading states
   - Error states
   - Success states
   - Retry logic

Generate complete store setup with type definitions (if using {{FRONTEND_LANGUAGE}})
```

### Step 15: Component Generation

```
Generate components for {{FRONTEND_FRAMEWORK}} based on this design system:

Design System: [PASTE DESIGN CONFIG]
Component Type: [BUTTON / INPUT / CARD / MODAL / etc.]
Language: {{FRONTEND_LANGUAGE}}
Styling: {{STYLING_FRAMEWORK}}

Requirements:
1. Atomic Components
   - Button (all variants)
   - Input (text, email, password, textarea)
   - Select dropdown
   - Checkbox
   - Radio button
   - Toggle switch

2. Composite Components
   - Form (with validation)
   - Modal/Dialog
   - Dropdown menu
   - Tabs
   - Accordion
   - Pagination
   - Data table

3. Layout Components
   - Header/Navbar
   - Footer
   - Sidebar
   - Page container
   - Grid system

For each component:
- Type definitions (if using TypeScript)
- Accessibility attributes (ARIA)
- Keyboard navigation support
- Loading and error states
- Responsive design
- Documentation comments
- Usage examples
```

### Step 16: View Integration

```
Create complete page implementations:

Page: [PAGE NAME]
API Endpoints: [RELEVANT ENDPOINTS]
Components: [AVAILABLE COMPONENTS]
State Management: {{STATE_MANAGEMENT}}
Data Fetching: {{DATA_FETCHING_LIBRARY}}
Framework: {{FRONTEND_FRAMEWORK}}
Language: {{FRONTEND_LANGUAGE}}

Generate:
1. Page Component
   - Data fetching logic
   - State management integration
   - Component composition
   - Error handling
   - Loading states

2. Form Handling
   - Form validation
   - Submit logic
   - Error display
   - Success feedback

3. API Integration
   - API calls with proper error handling
   - Optimistic updates
   - Cache invalidation
   - Retry logic

4. User Feedback
   - Loading spinners
   - Success messages
   - Error messages
   - Empty states

Requirements:
- Strict typing (if applicable)
- Proper error boundaries
- Accessibility compliance ({{ACCESSIBILITY_STANDARD}})
- Mobile responsive
- SEO optimization (meta tags)
```

* * *

## Phase 5: Deployment & Polish

### Step 17: E2E Testing Script

```
Generate end-to-end tests using {{E2E_TEST_FRAMEWORK}}:

User Stories: [PASTE STORIES]
Application URL: [URL]
Frontend: {{FRONTEND_FRAMEWORK}}
Backend: {{BACKEND_FRAMEWORK}}

Create tests for:
1. Critical User Journeys
   - User registration flow
   - Login flow
   - Main feature usage
   - Checkout/payment (if applicable)

2. Test Scenarios
   - Happy path
   - Error scenarios
   - Edge cases
   - Cross-browser compatibility

3. Test Structure
   - Page Object Model
   - Reusable fixtures
   - Custom commands
   - Test data management

Requirements:
- Descriptive test names
- Proper assertions
- Screenshot on failure
- Video recording
- Parallel execution support
- CI/CD integration for {{CI_CD_PLATFORM}}
```

### Step 18: Documentation Generation

```
Generate comprehensive documentation for this project:

Project: {{PROJECT_NAME}}
Description: {{PROJECT_DESCRIPTION}}
Tech Stack:
- Frontend: {{FRONTEND_FRAMEWORK}}
- Backend: {{BACKEND_FRAMEWORK}}
- Database: {{DATABASE_SYSTEM}}
- Hosting: {{FRONTEND_HOSTING}} / {{BACKEND_HOSTING}}

API Spec: [PASTE API SPEC]
Architecture: [PASTE ARCHITECTURE DOC]

Create:
1. README.md
   - Project overview
   - Features list
   - Tech stack
   - Prerequisites
   - Installation steps (using {{PACKAGE_MANAGER}})
   - Environment variables
   - Running locally
   - Running tests
   - Deployment instructions
   - Contributing guidelines
   - License

2. API Documentation
   - Generate from {{API_SPECIFICATION_FORMAT}}
   - Add usage examples
   - Include authentication guide
   - Add rate limiting info

3. Architecture Decision Records (ADRs)
   - Document key technical decisions
   - Explain rationale
   - List alternatives considered

4. Troubleshooting Guide
   - Common issues and solutions
   - Debug tips
   - FAQ

5. Deployment Guide
   - Step-by-step deployment to {{FRONTEND_HOSTING}} and {{BACKEND_HOSTING}}
   - Environment configuration
   - Database migration
   - Rollback procedures
```

### Step 19: Deployment Config

```
Create deployment configuration for:

Platform: {{CI_CD_PLATFORM}}
Frontend: {{FRONTEND_FRAMEWORK}} on {{FRONTEND_HOSTING}}
Backend: {{BACKEND_FRAMEWORK}} on {{BACKEND_HOSTING}}
Database: {{DATABASE_SYSTEM}} on {{DATABASE_HOSTING}}
Containerization: {{CONTAINERIZATION}}

Generate:
1. CI/CD Pipeline
   - Build steps
   - Test execution
   - Deployment steps
   - Environment-specific configs

2. Infrastructure as Code (if using {{IAC_TOOL}})
   - Database setup
   - Networking configuration
   - Security groups
   - Load balancer
   - Auto-scaling rules

3. Environment Configuration
   - Development environment
   - Staging environment
   - Production environment
   - Environment variables management

4. Monitoring Setup
   - Error tracking ({{ERROR_TRACKING}})
   - Performance monitoring ({{PERFORMANCE_MONITORING}})
   - Uptime monitoring
   - Log aggregation ({{LOGGING_SERVICE}})

5. Backup & Recovery
   - Database backup strategy
   - Disaster recovery plan
   - Rollback procedures

Requirements:
- Zero-downtime deployment
- Automated rollback on failure
- Health checks
- Blue-green deployment support (if applicable)
```

### Step 20: Final Review Checklist

```
Perform a comprehensive review of the application:

Tech Stack:
- Frontend: {{FRONTEND_FRAMEWORK}}
- Backend: {{BACKEND_FRAMEWORK}}
- Database: {{DATABASE_SYSTEM}}
- Testing: {{UNIT_TEST_FRAMEWORK}}, {{E2E_TEST_FRAMEWORK}}

1. Security Audit
   - [ ] All inputs validated and sanitized
   - [ ] SQL injection prevention verified
   - [ ] XSS prevention implemented
   - [ ] CSRF protection enabled
   - [ ] Authentication properly implemented ({{AUTHENTICATION_METHOD}})
   - [ ] Authorization checks on all protected routes
   - [ ] Sensitive data encrypted
   - [ ] Security headers configured
   - [ ] Rate limiting in place
   - [ ] Dependencies scanned for vulnerabilities

2. Performance Optimization
   - [ ] Images optimized and lazy-loaded
   - [ ] Code splitting implemented
   - [ ] Bundle size analyzed and optimized
   - [ ] Database queries optimized
   - [ ] Caching strategy implemented ({{CACHING_SYSTEM}})
   - [ ] CDN configured for static assets ({{CDN_PROVIDER}})
   - [ ] Lighthouse score > 90

3. Accessibility
   - [ ] {{ACCESSIBILITY_STANDARD}} compliance verified
   - [ ] Keyboard navigation works
   - [ ] Screen reader tested
   - [ ] Color contrast ratios meet standards
   - [ ] ARIA labels present
   - [ ] Focus indicators visible

4. Testing
   - [ ] Unit test coverage > 80%
   - [ ] Integration tests passing
   - [ ] E2E tests covering critical paths
   - [ ] Cross-browser testing completed
   - [ ] Mobile responsiveness verified

5. Documentation
   - [ ] README complete and accurate
   - [ ] API documentation generated
   - [ ] Code comments added
   - [ ] Deployment guide written
   - [ ] Troubleshooting guide created

6. Deployment Readiness
   - [ ] Environment variables documented
   - [ ] Database migrations tested
   - [ ] Backup strategy in place
   - [ ] Monitoring configured ({{ERROR_TRACKING}})
   - [ ] Error tracking enabled
   - [ ] CI/CD pipeline working ({{CI_CD_PLATFORM}})
   - [ ] Rollback procedure documented

Generate a detailed report for each section with pass/fail status and recommendations.
```

* * *

## General Prompt Enhancement Techniques

### Making Prompts More Effective

1.  **Be Specific About Context**

```
Instead of: "Create a login form"
Use: "Create a login form component for {{FRONTEND_FRAMEWORK}} using {{FRONTEND_LANGUAGE}} and {{STYLING_FRAMEWORK}}. Include email and password fields, remember me checkbox, forgot password link, and proper error handling. Use {{STATE_MANAGEMENT}} for state management."
```

2.  **Provide Examples**

```
"Generate API endpoints following this pattern for {{API_ARCHITECTURE}}:
GET /api/v1/posts - List all posts
POST /api/v1/posts - Create a post
GET /api/v1/posts/:id - Get single post
PUT /api/v1/posts/:id - Update post
DELETE /api/v1/posts/:id - Delete post

Now generate similar endpoints for [ENTITY] using {{BACKEND_FRAMEWORK}}"
```

3.  **Specify Output Format**

```
"Output the result as:
1. Type definitions (using {{FRONTEND_LANGUAGE}})
2. Implementation code
3. Usage example
4. Test cases (using {{UNIT_TEST_FRAMEWORK}})

Format code blocks with proper syntax highlighting for {{BACKEND_LANGUAGE}}."
```

4.  **Request Explanations**

```
"For each function, include:
- Documentation comment explaining purpose
- Parameter descriptions
- Return value description
- Usage example
- Edge cases handled

Use {{BACKEND_LANGUAGE}} documentation conventions."
```

5.  **Iterative Refinement**

```
First prompt: "Generate a user registration form for {{FRONTEND_FRAMEWORK}}"
Review output, then:
"Enhance the form to include:
- Real-time email validation
- Password strength indicator
- Terms of service checkbox
- Integration with {{AUTHENTICATION_METHOD}}"
```

6.  **Constraint Specification**

```
"Generate code with these constraints:
- Maximum function length: 50 lines
- No nested ternary operators
- Use early returns for error handling
- Follow {{LINTER}} rules
- Use {{FRONTEND_LANGUAGE}} strict mode compliance"
```

* * *

## Prompt Chaining for Complex Tasks

### Example: Complete Feature Implementation

**Prompt 1: Planning**

```
I need to implement a [FEATURE] that allows users to [ACTION].

Tech Stack:
- Frontend: {{FRONTEND_FRAMEWORK}}
- Backend: {{BACKEND_FRAMEWORK}}
- Database: {{DATABASE_SYSTEM}}

First, help me plan this feature:
1. What data models are needed?
2. What API endpoints are required?
3. What frontend components are needed?
4. What are potential edge cases?
5. What security considerations exist?

Don't implement yet, just provide the plan.
```

**Prompt 2: API Design**

```
Based on this plan: [PASTE PLAN]

Now design the API endpoints in {{API_SPECIFICATION_FORMAT}} format.
Include request/response schemas, validation rules, and error responses.
Use {{BACKEND_LANGUAGE}} for examples.
```

**Prompt 3: Backend Implementation**

```
Using this API spec: [PASTE SPEC]

Implement the backend using {{BACKEND_FRAMEWORK}} and {{BACKEND_LANGUAGE}}:
1. Service layer with business logic
2. Controller layer
3. Route definitions
4. Input validation
5. Error handling

Use {{ORM_TOOL}} for database operations.
```

**Prompt 4: Tests**

```
For this implementation: [PASTE CODE]

Generate comprehensive tests using {{UNIT_TEST_FRAMEWORK}}:
1. Unit tests for service layer
2. Integration tests for API endpoints
3. Test fixtures and mocks

Use {{BACKEND_LANGUAGE}} syntax.
```

**Prompt 5: Frontend Components**

```
Create components for this feature using {{FRONTEND_FRAMEWORK}}:

API Endpoints: [PASTE ENDPOINTS]
Design System: [PASTE DESIGN TOKENS]
Styling: {{STYLING_FRAMEWORK}}

Generate:
1. Form component with validation
2. List/table component
3. Detail view component
4. State management integration using {{STATE_MANAGEMENT}}
```

**Prompt 6: Integration**

```
Now integrate everything:

Backend: [PASTE BACKEND CODE]
Frontend: [PASTE FRONTEND CODE]
Data Fetching: {{DATA_FETCHING_LIBRARY}}

Create:
1. API client functions
2. Custom hooks for data fetching (if using React)
3. Error handling
4. Loading states
5. Success feedback
```

* * *

## Debugging Prompts

### When Tests Fail

```
I have a failing test in {{UNIT_TEST_FRAMEWORK}}:

Test Name: [NAME]
Expected: [EXPECTED]
Actual: [ACTUAL]
Error: [ERROR MESSAGE]
Stack Trace: [TRACE]

Code being tested ({{BACKEND_LANGUAGE}}):
[PASTE CODE]

Framework: {{BACKEND_FRAMEWORK}}
ORM: {{ORM_TOOL}}

Please:
1. Explain why the test is failing
2. Identify the root cause
3. Provide a fix with explanation
4. Suggest how to prevent similar issues
```

### When Code Doesn't Work

```
This code isn't working as expected:

Language: {{BACKEND_LANGUAGE}}
Framework: {{BACKEND_FRAMEWORK}}
Code:
[PASTE CODE]

Expected behavior: [DESCRIBE]
Actual behavior: [DESCRIBE]
Error messages: [PASTE ERRORS]

Context:
- Dependencies: [LIST]
- Environment: [DEV/PROD]

Please debug and provide a working solution with explanation.
```

### Performance Issues

```
This code is too slow:

Language: {{BACKEND_LANGUAGE}}
Framework: {{BACKEND_FRAMEWORK}}
Database: {{DATABASE_SYSTEM}}
Code:
[PASTE CODE]

Performance metrics:
- Current execution time: [TIME]
- Target execution time: [TIME]
- Data volume: [SIZE]

Please:
1. Identify performance bottlenecks
2. Suggest optimizations
3. Provide optimized code
4. Explain the improvements
```

* * *

## Code Review Prompts

```
Review this code for:

Language: {{BACKEND_LANGUAGE}}
Framework: {{BACKEND_FRAMEWORK}}
Code:
[PASTE CODE]

Check for:
1. Security vulnerabilities
2. Performance issues
3. Code quality and maintainability
4. Best practices adherence for {{BACKEND_FRAMEWORK}}
5. Potential bugs
6. Missing error handling
7. Accessibility issues (for frontend code)
8. Type safety (if using {{FRONTEND_LANGUAGE}})

Provide:
- List of issues found (severity: high/medium/low)
- Explanation of each issue
- Suggested fixes
- Refactoring recommendations
```

* * *

## Refactoring Prompts

```
Refactor this code to improve:

Current Code ({{BACKEND_LANGUAGE}}):
[PASTE CODE]

Framework: {{BACKEND_FRAMEWORK}}

Goals:
- [ ] Improve readability
- [ ] Reduce complexity
- [ ] Better error handling
- [ ] Add type definitions (if applicable)
- [ ] Follow SOLID principles
- [ ] Improve testability
- [ ] Better performance

Provide:
1. Refactored code
2. Explanation of changes
3. Before/after comparison
4. Benefits of refactoring
```

* * *

## Migration Prompts

```
Help me migrate this code:

From: [OLD FRAMEWORK/VERSION]
To: {{BACKEND_FRAMEWORK}} / {{FRONTEND_FRAMEWORK}}

Current Code:
[PASTE CODE]

Requirements:
- Maintain existing functionality
- Use new framework best practices
- Improve code quality where possible
- Update dependencies
- Provide migration guide

Include:
1. Migrated code
2. List of breaking changes
3. Step-by-step migration guide
4. Testing recommendations
```

* * *

## Technology-Specific Prompt Additions

When you've filled out your questionnaire, add these details to prompts:

**For TypeScript projects:**

```
Additional requirements:
- Use strict TypeScript mode
- Define all types explicitly
- No 'any' types
- Use generics where appropriate
```

**For React projects:**

```
Additional requirements:
- Use functional components with hooks
- Follow React best practices
- Implement proper error boundaries
- Use memo/useMemo/useCallback appropriately
```

**For API projects:**

```
Additional requirements:
- Follow RESTful conventions (or GraphQL schema design)
- Implement proper HTTP status codes
- Add request/response logging
- Include API versioning
```

**For Database operations:**

```
Additional requirements:
- Use transactions where appropriate
- Implement proper indexing
- Add query optimization
- Include migration rollback
```

* * *

## Quick Reference: Common Placeholders

Replace these in your prompts:

### Project

-   `{{PROJECT_NAME}}`
-   `{{PROJECT_DESCRIPTION}}`
-   `{{PROJECT_TYPE}}`
-   `{{TARGET_USERS}}`
-   `{{EXPECTED_SCALE}}`

### Frontend

-   `{{FRONTEND_FRAMEWORK}}`
-   `{{FRONTEND_LANGUAGE}}`
-   `{{STYLING_FRAMEWORK}}`
-   `{{STATE_MANAGEMENT}}`
-   `{{BUILD_TOOL}}`
-   `{{DATA_FETCHING_LIBRARY}}`

### Backend

-   `{{BACKEND_RUNTIME}}`
-   `{{BACKEND_FRAMEWORK}}`
-   `{{BACKEND_LANGUAGE}}`
-   `{{API_ARCHITECTURE}}`
-   `{{API_SPECIFICATION_FORMAT}}`

### Database

-   `{{DATABASE_SYSTEM}}`
-   `{{ORM_TOOL}}`
-   `{{CACHING_SYSTEM}}`

### Authentication

-   `{{AUTHENTICATION_METHOD}}`
-   `{{AUTH_LIBRARY}}`

### Testing

-   `{{UNIT_TEST_FRAMEWORK}}`
-   `{{E2E_TEST_FRAMEWORK}}`
-   `{{API_TEST_TOOL}}`

### Deployment

-   `{{FRONTEND_HOSTING}}`
-   `{{BACKEND_HOSTING}}`
-   `{{CI_CD_PLATFORM}}`
-   `{{CONTAINERIZATION}}`

### Tools

-   `{{LINTER}}`
-   `{{CODE_FORMATTER}}`
-   `{{PACKAGE_MANAGER}}`
-   `{{PRIMARY_IDE}}`
-   `{{VERSION_CONTROL}}`

### Monitoring

-   `{{ERROR_TRACKING}}`
-   `{{ANALYTICS_TOOL}}`
-   `{{LOGGING_SERVICE}}`

* * *

## Tips for Effective AI Collaboration

1.  **Start Broad, Then Narrow:** Begin with high-level prompts, then drill down into specifics
2.  **Provide Context:** Always include your tech stack and constraints
3.  **Request Explanations:** Ask AI to explain its reasoning
4.  **Iterate:** Use AI responses to refine your next prompt
5.  **Verify Output:** Always review and test AI-generated code
6.  **Document Decisions:** Keep track of why you chose certain approaches
7.  **Use Examples:** Show AI what you want with concrete examples
8.  **Be Specific:** The more specific your prompt, the better the output
9.  **Request Alternatives:** Ask for multiple approaches to compare
10.  **Maintain Consistency:** Use the same terminology throughout your prompts

* * *

**Remember:** These prompts are templates. Customize them based on your specific needs, project requirements, and the AI assistant you're using. The goal is to leverage AI to accelerate development while maintaining human oversight and quality control.