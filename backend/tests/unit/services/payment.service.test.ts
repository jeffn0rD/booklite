/**
 * Payment Service Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentService } from '@/features/payments/services/payment.service.js';
import { createMockSupabaseClient, TEST_USER_IDS } from '@tests/setup/test-setup.js';
import { validPayment, partialPayment, invalidPayments } from '@tests/fixtures/payments.js';
import { ValidationError, NotFoundError } from '@/shared/errors/index.js';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    paymentService = new PaymentService(mockSupabase);
  });

  describe('create', () => {
    it('should create a payment with valid data', async () => {
      const mockPayment = { id: '123', ...validPayment, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockPayment,
        error: null,
      });

      const result = await paymentService.create(TEST_USER_IDS.user1, 'doc-123', validPayment);
      expect(result).toEqual(mockPayment);
    });

    it('should throw ValidationError for negative amount', async () => {
      await expect(
        paymentService.create(TEST_USER_IDS.user1, 'doc-123', invalidPayments.negativeAmount)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid payment method', async () => {
      await expect(
        paymentService.create(TEST_USER_IDS.user1, 'doc-123', invalidPayments.invalidMethod)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('get', () => {
    it('should retrieve a payment by id', async () => {
      const mockPayment = { id: '123', ...validPayment, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockPayment,
        error: null,
      });

      const result = await paymentService.get(TEST_USER_IDS.user1, '123');
      expect(result).toEqual(mockPayment);
    });
  });

  describe('list', () => {
    it('should list all payments for a user', async () => {
      const mockPayments = [
        { id: '1', ...validPayment, user_id: TEST_USER_IDS.user1 },
        { id: '2', ...partialPayment, user_id: TEST_USER_IDS.user1 },
      ];
      mockSupabase.from().select().eq().eq().order().range.mockResolvedValue({
        data: mockPayments,
        error: null,
        count: 2,
      });

      const result = await paymentService.list(TEST_USER_IDS.user1, {});
      expect(result.data).toEqual(mockPayments);
    });

    it('should filter by document', async () => {
      const mockPayments = [{ id: '1', ...validPayment, document_id: 'doc-123' }];
      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockPayments,
        error: null,
        count: 1,
      });

      const result = await paymentService.list(TEST_USER_IDS.user1, { document_id: 'doc-123' });
      expect(result.data).toEqual(mockPayments);
    });

    it('should filter by payment method', async () => {
      const mockPayments = [{ id: '1', ...validPayment, payment_method: 'bank_transfer' }];
      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockPayments,
        error: null,
        count: 1,
      });

      const result = await paymentService.list(TEST_USER_IDS.user1, { payment_method: 'bank_transfer' });
      expect(result.data).toEqual(mockPayments);
    });
  });

  describe('update', () => {
    it('should update a payment', async () => {
      const updates = { notes: 'Updated notes' };
      const mockPayment = { id: '123', ...validPayment, ...updates };
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: mockPayment,
        error: null,
      });

      const result = await paymentService.update(TEST_USER_IDS.user1, '123', updates);
      expect(result).toEqual(mockPayment);
    });
  });

  describe('delete', () => {
    it('should soft delete a payment', async () => {
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: { id: '123', deleted_at: new Date().toISOString() },
        error: null,
      });

      await paymentService.delete(TEST_USER_IDS.user1, '123');
      expect(mockSupabase.from().update).toHaveBeenCalled();
    });
  });
});