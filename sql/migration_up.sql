-- =====================================================
-- Booklite Database Schema - Complete Migration (UP)
-- PostgreSQL/Supabase Implementation
-- =====================================================
-- Description: Complete database migration script
-- Version: 1.0
-- Execution: Run this script to create the entire database schema
-- =====================================================

-- Start transaction
BEGIN;

-- =====================================================
-- PHASE 1: CORE SCHEMA
-- =====================================================
\echo 'Phase 1: Creating core tables...'
\i 01_schema_core.sql

-- =====================================================
-- PHASE 2: CONSTRAINTS
-- =====================================================
\echo 'Phase 2: Adding constraints and foreign keys...'
\i 02_constraints.sql

-- =====================================================
-- PHASE 3: INDEXES
-- =====================================================
\echo 'Phase 3: Creating performance indexes...'
\i 03_indexes.sql

-- =====================================================
-- PHASE 4: TRIGGERS
-- =====================================================
\echo 'Phase 4: Creating triggers and business logic...'
\i 04_triggers.sql

-- =====================================================
-- PHASE 5: ROW LEVEL SECURITY
-- =====================================================
\echo 'Phase 5: Enabling RLS and creating policies...'
\i 05_rls_policies.sql

-- =====================================================
-- PHASE 6: SEED DATA (Optional - comment out for production)
-- =====================================================
-- \echo 'Phase 6: Loading seed data...'
-- \i 06_seed_data.sql

-- Commit transaction
COMMIT;

\echo 'Migration completed successfully!'
\echo 'Database schema version: 1.0'
\echo ''
\echo 'Next steps:'
\echo '1. Verify all tables were created: \dt'
\echo '2. Check RLS policies: SELECT * FROM pg_policies;'
\echo '3. Review indexes: \di'
\echo '4. Test with sample data'