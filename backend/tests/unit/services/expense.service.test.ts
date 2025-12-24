/**
 * Expense Service Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExpenseService } from '@/features/expenses/services/expense.service.js';
import { createMockSupabaseClient, TEST_USER_IDS } from '@tests/setup/test-setup.js';
import { validExpense, billableExpense, invalidExpenses } from '@tests/fixtures/expenses.js';
import { ValidationError, NotFoundError } from '@/shared/errors/index.js';

describe('ExpenseService', () => {
  let expenseService: ExpenseService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    expenseService = new ExpenseService(mockSupabase);
  });

  describe('create', () => {
    it('should create an expense with valid data', async () => {
      const mockExpense = { id: '123', ...validExpense, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockExpense,
        error: null,
      });

      const result = await expenseService.create(TEST_USER_IDS.user1, validExpense);
      expect(result).toEqual(mockExpense);
    });

    it('should create a billable expense', async () => {
      const mockExpense = { id: '123', ...billableExpense, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockExpense,
        error: null,
      });

      const result = await expenseService.create(TEST_USER_IDS.user1, billableExpense);
      expect(result.is_billable).toBe(true);
    });

    it('should throw ValidationError for negative amount', async () => {
      await expect(
        expenseService.create(TEST_USER_IDS.user1, invalidExpenses.negativeAmount)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty description', async () => {
      await expect(
        expenseService.create(TEST_USER_IDS.user1, invalidExpenses.emptyDescription)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('get', () => {
    it('should retrieve an expense by id', async () => {
      const mockExpense = { id: '123', ...validExpense, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockExpense,
        error: null,
      });

      const result = await expenseService.get(TEST_USER_IDS.user1, '123');
      expect(result).toEqual(mockExpense);
    });
  });

  describe('list', () => {
    it('should list all expenses for a user', async () => {
      const mockExpenses = [
        { id: '1', ...validExpense, user_id: TEST_USER_IDS.user1 },
        { id: '2', ...billableExpense, user_id: TEST_USER_IDS.user1 },
      ];
      mockSupabase.from().select().eq().eq().order().range.mockResolvedValue({
        data: mockExpenses,
        error: null,
        count: 2,
      });

      const result = await expenseService.list(TEST_USER_IDS.user1, {});
      expect(result.data).toEqual(mockExpenses);
    });

    it('should filter by billable status', async () => {
      const mockExpenses = [{ id: '1', ...billableExpense, is_billable: true }];
      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockExpenses,
        error: null,
        count: 1,
      });

      const result = await expenseService.list(TEST_USER_IDS.user1, { is_billable: true });
      expect(result.data).toEqual(mockExpenses);
    });

    it('should filter by category', async () => {
      const mockExpenses = [{ id: '1', ...validExpense, category_id: 'cat-123' }];
      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockExpenses,
        error: null,
        count: 1,
      });

      const result = await expenseService.list(TEST_USER_IDS.user1, { category_id: 'cat-123' });
      expect(result.data).toEqual(mockExpenses);
    });

    it('should filter by date range', async () => {
      const mockExpenses = [{ id: '1', ...validExpense, expense_date: '2024-01-15' }];
      mockSupabase.from().select().eq().eq().gte().lte().order().range.mockResolvedValue({
        data: mockExpenses,
        error: null,
        count: 1,
      });

      const result = await expenseService.list(TEST_USER_IDS.user1, {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });
      expect(result.data).toEqual(mockExpenses);
    });
  });

  describe('update', () => {
    it('should update an expense', async () => {
      const updates = { description: 'Updated description', amount: 200.00 };
      const mockExpense = { id: '123', ...validExpense, ...updates };
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: mockExpense,
        error: null,
      });

      const result = await expenseService.update(TEST_USER_IDS.user1, '123', updates);
      expect(result).toEqual(mockExpense);
    });
  });

  describe('delete', () => {
    it('should soft delete an expense', async () => {
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: { id: '123', deleted_at: new Date().toISOString() },
        error: null,
      });

      await expenseService.delete(TEST_USER_IDS.user1, '123');
      expect(mockSupabase.from().update).toHaveBeenCalled();
    });
  });
});