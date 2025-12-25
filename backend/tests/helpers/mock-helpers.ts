/**
 * Simple Mock Helpers for Testing
 * 
 * These helpers create simple, predictable mocks for Supabase operations.
 * They focus on testing service logic rather than database behavior.
 */

import { vi } from 'vitest';
import { TEST_USER_IDS } from '../setup/test-setup.js';

/**
 * Create a simple mock Supabase client
 * 
 * This mock returns predictable data for all operations.
 * It's designed to be simple and easy to understand.
 * 
 * @param customMockData - Optional custom mock data for specific tests
 * @returns Mock Supabase client
 */
export function createSimpleMockSupabase(customMockData?: any) {
  const defaultMockData = {
    id: '123',
    user_id: TEST_USER_IDS.user1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...customMockData,
  };

  return {
    from: vi.fn(() => ({
      // SELECT operations
      select: vi.fn(() => {
        const selectChain = {
          eq: vi.fn(() => {
            const eqChain = {
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: defaultMockData,
                  error: null,
                }),
                order: vi.fn().mockResolvedValue({
                  data: [defaultMockData],
                  error: null,
                }),
              })),
              is: vi.fn(() => {
                const isChain = {
                  order: vi.fn(() => {
                    const orderChain = {
                      limit: vi.fn().mockResolvedValue({
                        data: [defaultMockData],
                        error: null,
                      }),
                      then: vi.fn((resolve) => {
                        return Promise.resolve({ data: [defaultMockData], error: null }).then(resolve);
                      }),
                    };
                    return orderChain;
                  }),
                  or: vi.fn(() => ({
                    order: vi.fn(() => ({
                      limit: vi.fn().mockResolvedValue({
                        data: [defaultMockData],
                        error: null,
                      }),
                      then: vi.fn((resolve) => {
                        return Promise.resolve({ data: [defaultMockData], error: null }).then(resolve);
                      }),
                    })),
                  })),
                  then: vi.fn((resolve) => {
                    return Promise.resolve({ data: [defaultMockData], error: null }).then(resolve);
                  }),
                };
                return isChain;
              }),
              or: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn().mockResolvedValue({
                    data: [defaultMockData],
                    error: null,
                  }),
                  then: vi.fn((resolve) => {
                    return Promise.resolve({ data: [defaultMockData], error: null }).then(resolve);
                  }),
                })),
              })),
              order: vi.fn(() => {
                const orderChain = {
                  limit: vi.fn().mockResolvedValue({
                    data: [defaultMockData],
                    error: null,
                  }),
                  then: vi.fn((resolve) => {
                    return Promise.resolve({ data: [defaultMockData], error: null }).then(resolve);
                  }),
                };
                return orderChain;
              }),
              ilike: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn().mockResolvedValue({
                    data: [defaultMockData],
                    error: null,
                  }),
                  then: vi.fn((resolve) => {
                    return Promise.resolve({ data: [defaultMockData], error: null }).then(resolve);
                  }),
                })),
              })),
              then: vi.fn((resolve) => {
                return Promise.resolve({ data: [defaultMockData], error: null }).then(resolve);
              }),
            };
            return eqChain;
          }),
          single: vi.fn().mockResolvedValue({
            data: defaultMockData,
            error: null,
          }),
          order: vi.fn().mockResolvedValue({
            data: [defaultMockData],
            error: null,
          }),
        };
        return selectChain;
      }),

      // INSERT operations
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: defaultMockData,
            error: null,
          }),
        })),
      })),

      // UPDATE operations
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: defaultMockData,
                error: null,
              }),
            })),
          })),
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: defaultMockData,
              error: null,
            }),
          })),
        })),
      })),

      // DELETE operations
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        })),
      })),
    })),

    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: TEST_USER_IDS.user1 } },
        error: null,
      }),
    },
  };
}

/**
 * Create a mock that returns an error
 * 
 * @param errorMessage - Error message
 * @param errorCode - Error code (optional)
 * @returns Mock Supabase client that returns errors
 */
export function createErrorMockSupabase(errorMessage: string, errorCode?: string) {
  const mockError = {
    message: errorMessage,
    code: errorCode || 'PGRST116',
    details: null,
    hint: null,
  };

  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          })),
        })),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
              }),
            })),
            then: vi.fn((resolve) => {
              return Promise.resolve({ data: null, error: mockError }).then(resolve);
            }),
          })),
          then: vi.fn((resolve) => {
            return Promise.resolve({ data: null, error: mockError }).then(resolve);
          }),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        })),
      })),
    })),
  };
}

/**
 * Create a mock that returns empty results
 * 
 * @returns Mock Supabase client that returns empty arrays
 */
export function createEmptyMockSupabase() {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => {
          const eqChain = {
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'No rows returned', code: 'PGRST116' },
              }),
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
            is: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
              then: vi.fn((resolve) => {
                return Promise.resolve({ data: [], error: null }).then(resolve);
              }),
            })),
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
            then: vi.fn((resolve) => {
              return Promise.resolve({ data: [], error: null }).then(resolve);
            }),
          };
          return eqChain;
        }),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,  // Return null data and null error to trigger !data check
              }),
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        })),
      })),
    })),
  };
}