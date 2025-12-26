# Schema Audit and Fix - Critical Issue

## Problem Statement
Integration tests are failing due to fundamental mismatch between:
1. Database schema (SQL files) 
2. TypeScript types and Zod validation schemas
3. Test fixtures and service implementations

**Example**: `clients` table has `billing_address jsonb` but code uses flat fields like `address`, `city`, `state`, etc.

## Investigation Tasks

### [ ] 1. Audit Database Schema
- [ ] Review all SQL schema files in `/sql/`
- [ ] Document actual table structures
- [ ] Identify all JSONB fields and their intended structure

### [ ] 2. Audit TypeScript Types
- [ ] Review all type definitions in `/backend/src/types/`
- [ ] Compare with database schema
- [ ] Document mismatches

### [ ] 3. Audit Zod Schemas
- [ ] Review all schemas in `/backend/src/schemas/`
- [ ] Compare with database schema
- [ ] Document validation mismatches

### [ ] 4. Audit Services
- [ ] Review all services in `/backend/src/services/`
- [ ] Check database query structures
- [ ] Verify field mappings

### [ ] 5. Audit Test Fixtures
- [ ] Review all fixtures in `/backend/tests/fixtures/`
- [ ] Compare with actual schema requirements
- [ ] Document data structure issues

### [ ] 6. Root Cause Analysis
- [ ] Why did this happen?
- [ ] What process failed?
- [ ] How to prevent in future?

### [ ] 7. Fix Strategy
- [ ] Decide: Change schema or change code?
- [ ] Document rationale for each entity
- [ ] Create fix plan with priorities

### [ ] 8. Implementation
- [ ] Fix schemas (SQL or TypeScript)
- [ ] Update services
- [ ] Update test fixtures
- [ ] Run tests to verify

### [ ] 9. Documentation
- [ ] Document all changes
- [ ] Update specifications
- [ ] Update RAG database
- [ ] Create prevention guidelines

### [ ] 10. Commit and Push
- [ ] Commit all fixes
- [ ] Update PROGRESS_SUMMARY.md
- [ ] Push to repository

## Questions to Answer

### 2a) Why was address specified as JSON?
- Need to check original ERD and specifications
- Query RAG database for design decisions
- Determine if this was intentional or error

### 2b) How widespread is this issue?
- Audit all 14 entities
- Document every mismatch
- Assess impact on existing code

## Priority
**CRITICAL** - Blocks all integration testing and production deployment