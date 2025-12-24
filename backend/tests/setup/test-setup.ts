/**
 * Test Setup and Configuration
 * 
 * Global setup for all tests including database initialization,
 * mock configurations, and test utilities.
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Test environment variables
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';
process.env.LOG_LEVEL = 'silent';

// Global test database client
let testSupabase: SupabaseClient;

// Setup before all tests
beforeAll(async () => {
  // Initialize test database client
  testSupabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Clean up test data
  await cleanupTestData();
});

// Setup before each test
beforeEach(async () => {
  // Reset mocks
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(async () => {
  // Clean up any test data created during the test
  await cleanupTestResources();
});

// Cleanup after all tests
afterAll(async () => {
  // Final cleanup
  await cleanupTestData();
});

/**
 * Clean up all test data from database
 */
async function cleanupTestData() {
  if (!testSupabase) return;

  try {
    // Delete test data in reverse order of dependencies
    const tables = [
      'document_line_items',
      'documents',
      'payments',
      'expenses',
      'projects',
      'clients',
      'categories',
      'tax_rates',
      'user_profiles',
    ];

    for (const table of tables) {
      await testSupabase
        .from(table)
        .delete()
        .like('email', '%@test.example.com');
    }
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

/**
 * Clean up test resources created during tests
 */
async function cleanupTestResources() {
  // Cleanup logic for resources created during tests
}

/**
 * Export test utilities
 */
export { testSupabase };

/**
 * Test user IDs for consistent testing
 */
export const TEST_USER_IDS = {
  user1: '550e8400-e29b-41d4-a716-446655440001',
  user2: '550e8400-e29b-41d4-a716-446655440002',
  user3: '550e8400-e29b-41d4-a716-446655440003',
};

/**
 * Mock Supabase client for unit tests
 */
export function createMockSupabaseClient() {
  return {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: TEST_USER_IDS.user1 } },
        error: null,
      }),
    },
  };
}