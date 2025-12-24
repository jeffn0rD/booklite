/**
 * Category Service Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CategoryService } from '@/features/categories/services/category.service.js';
import { createMockSupabaseClient, TEST_USER_IDS } from '@tests/setup/test-setup.js';
import { validCategory, expenseCategory, invalidCategories } from '@tests/fixtures/categories.js';
import { ValidationError, NotFoundError } from '@/shared/errors/index.js';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    categoryService = new CategoryService(mockSupabase);
  });

  describe('create', () => {
    it('should create a category with valid data', async () => {
      const mockCategory = { id: '123', ...validCategory, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockCategory,
        error: null,
      });

      const result = await categoryService.create(TEST_USER_IDS.user1, validCategory);
      expect(result).toEqual(mockCategory);
    });

    it('should create an expense category', async () => {
      const mockCategory = { id: '123', ...expenseCategory, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockCategory,
        error: null,
      });

      const result = await categoryService.create(TEST_USER_IDS.user1, expenseCategory);
      expect(result.type).toBe('expense');
    });

    it('should throw ValidationError for empty name', async () => {
      await expect(
        categoryService.create(TEST_USER_IDS.user1, invalidCategories.emptyName)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid type', async () => {
      await expect(
        categoryService.create(TEST_USER_IDS.user1, invalidCategories.invalidType)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('get', () => {
    it('should retrieve a category by id', async () => {
      const mockCategory = { id: '123', ...validCategory, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockCategory,
        error: null,
      });

      const result = await categoryService.get(TEST_USER_IDS.user1, '123');
      expect(result).toEqual(mockCategory);
    });
  });

  describe('list', () => {
    it('should list all categories for a user', async () => {
      const mockCategories = [
        { id: '1', ...validCategory, user_id: TEST_USER_IDS.user1 },
        { id: '2', ...expenseCategory, user_id: TEST_USER_IDS.user1 },
      ];
      mockSupabase.from().select().eq().eq().order().range.mockResolvedValue({
        data: mockCategories,
        error: null,
        count: 2,
      });

      const result = await categoryService.list(TEST_USER_IDS.user1, {});
      expect(result.data).toEqual(mockCategories);
    });

    it('should filter by type', async () => {
      const mockCategories = [{ id: '1', ...validCategory, type: 'income' }];
      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockCategories,
        error: null,
        count: 1,
      });

      const result = await categoryService.list(TEST_USER_IDS.user1, { type: 'income' });
      expect(result.data).toEqual(mockCategories);
    });

    it('should filter by active status', async () => {
      const mockCategories = [{ id: '1', ...validCategory, is_active: true }];
      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockCategories,
        error: null,
        count: 1,
      });

      const result = await categoryService.list(TEST_USER_IDS.user1, { is_active: true });
      expect(result.data).toEqual(mockCategories);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updates = { name: 'Updated Category', description: 'New description' };
      const mockCategory = { id: '123', ...validCategory, ...updates };
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: mockCategory,
        error: null,
      });

      const result = await categoryService.update(TEST_USER_IDS.user1, '123', updates);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('delete', () => {
    it('should soft delete a category', async () => {
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: { id: '123', deleted_at: new Date().toISOString() },
        error: null,
      });

      await categoryService.delete(TEST_USER_IDS.user1, '123');
      expect(mockSupabase.from().update).toHaveBeenCalled();
    });
  });
});