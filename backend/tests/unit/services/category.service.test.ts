/**
 * Category Service Unit Tests
 * 
 * Tests for CategoryService business logic using simple mocks.
 * These tests focus on service behavior, not database implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CategoryService } from '@/features/categories/services/category.service.js';
import { TEST_USER_IDS } from '@tests/setup/test-setup.js';
import { createSimpleMockSupabase, createErrorMockSupabase, createEmptyMockSupabase } from '@tests/helpers/mock-helpers.js';
import { validCategory, expenseCategory } from '@tests/fixtures/categories.js';
import { NotFoundError } from '@/shared/errors/index.js';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockSupabase: any;

  beforeEach(() => {
    // Create a simple mock with predictable behavior
    mockSupabase = createSimpleMockSupabase({
      name: validCategory.name,
      type: validCategory.type,
      description: validCategory.description,
      is_active: true,
    });
    categoryService = new CategoryService(mockSupabase);
  });

  describe('create', () => {
    it('should create a category with valid data', async () => {
      const result = await categoryService.create(TEST_USER_IDS.user1, validCategory);
      
      // Verify the result has expected properties
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(validCategory.name);
      expect(result.type).toBe(validCategory.type);
      expect(result.user_id).toBe(TEST_USER_IDS.user1);
      expect(result.created_at).toBeDefined();
      
      // Verify Supabase methods were called correctly
      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
    });

    it('should create an expense category', async () => {
      // Update mock to return expense category data
      mockSupabase = createSimpleMockSupabase({
        name: expenseCategory.name,
        type: 'expense',
        description: expenseCategory.description,
      });
      categoryService = new CategoryService(mockSupabase);
      
      const result = await categoryService.create(TEST_USER_IDS.user1, expenseCategory);
      
      expect(result.type).toBe('expense');
      expect(result.name).toBe(expenseCategory.name);
    });

    it('should handle database errors gracefully', async () => {
      // Create a mock that returns an error
      mockSupabase = createErrorMockSupabase('Database constraint violation', '23505');
      categoryService = new CategoryService(mockSupabase);

      await expect(
        categoryService.create(TEST_USER_IDS.user1, validCategory)
      ).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should retrieve a category by id', async () => {
      const result = await categoryService.get(TEST_USER_IDS.user1, 123);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(validCategory.name);
      expect(result.user_id).toBe(TEST_USER_IDS.user1);
    });

    it('should throw NotFoundError for non-existent category', async () => {
      // Mock returns no data (not found)
      mockSupabase = createEmptyMockSupabase();
      categoryService = new CategoryService(mockSupabase);

      await expect(
        categoryService.get(TEST_USER_IDS.user1, 999)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('should list all categories for a user', async () => {
      const result = await categoryService.list(TEST_USER_IDS.user1, {});
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].user_id).toBe(TEST_USER_IDS.user1);
    });

    it('should handle search queries', async () => {
      const result = await categoryService.list(TEST_USER_IDS.user1, {
        search: 'Consulting',
      });
      
      expect(Array.isArray(result)).toBe(true);
      // Mock returns data, so we should have results
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty results', async () => {
      // Mock returns empty array
      mockSupabase = createEmptyMockSupabase();
      categoryService = new CategoryService(mockSupabase);
      
      const result = await categoryService.list(TEST_USER_IDS.user1, {});
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle sorting', async () => {
      const result = await categoryService.list(TEST_USER_IDS.user1, {
        sort: 'name',
      });
      
      expect(Array.isArray(result)).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
    });

    it('should handle pagination', async () => {
      const result = await categoryService.list(TEST_USER_IDS.user1, {
        limit: 10,
      });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updates = { name: 'Updated Category', description: 'New description' };
      
      // Update mock to return updated data
      mockSupabase = createSimpleMockSupabase({
        id: '123',
        ...validCategory,
        ...updates,
      });
      categoryService = new CategoryService(mockSupabase);
      
      const result = await categoryService.update(TEST_USER_IDS.user1, 123, updates);
      
      expect(result.name).toBe(updates.name);
      expect(result.description).toBe(updates.description);
    });

    it('should throw NotFoundError when updating non-existent category', async () => {
      // Mock returns no data (not found)
      mockSupabase = createEmptyMockSupabase();
      categoryService = new CategoryService(mockSupabase);

      await expect(
        categoryService.update(TEST_USER_IDS.user1, 999, { name: 'Updated' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      await expect(
        categoryService.delete(TEST_USER_IDS.user1, 123)
      ).resolves.not.toThrow();
      
      // Verify delete was called
      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
    });

    it('should handle database errors during deletion', async () => {
      // Mock returns an error
      mockSupabase = createErrorMockSupabase('Foreign key constraint violation', '23503');
      categoryService = new CategoryService(mockSupabase);

      await expect(
        categoryService.delete(TEST_USER_IDS.user1, 123)
      ).rejects.toThrow();
    });
  });
});