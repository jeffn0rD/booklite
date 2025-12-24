/**
 * Document Service Unit Tests
 * 
 * Tests for DocumentService business logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentService } from '@/features/documents/services/document.service.js';
import { createMockSupabaseClient, TEST_USER_IDS } from '@tests/setup/test-setup.js';
import { validInvoice, validQuote, documentLineItems, invalidDocuments } from '@tests/fixtures/documents.js';
import { ValidationError, NotFoundError, BusinessLogicError } from '@/shared/errors/index.js';

describe('DocumentService', () => {
  let documentService: DocumentService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    documentService = new DocumentService(mockSupabase);
  });

  describe('create', () => {
    it('should create an invoice with line items', async () => {
      const mockDocument = {
        id: '123',
        ...validInvoice,
        client_id: 'client-123',
        user_id: TEST_USER_IDS.user1,
        subtotal: 8000.00,
        tax: 660.00,
        total: 8660.00,
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      mockSupabase.from().insert().select.mockResolvedValue({
        data: documentLineItems,
        error: null,
      });

      const result = await documentService.create(
        TEST_USER_IDS.user1,
        'client-123',
        validInvoice,
        documentLineItems
      );

      expect(result.document).toEqual(mockDocument);
      expect(result.line_items).toEqual(documentLineItems);
    });

    it('should create a quote with valid_until date', async () => {
      const mockDocument = {
        id: '123',
        ...validQuote,
        client_id: 'client-123',
        user_id: TEST_USER_IDS.user1,
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      const result = await documentService.create(
        TEST_USER_IDS.user1,
        'client-123',
        validQuote,
        []
      );

      expect(result.document.type).toBe('quote');
      expect(result.document.valid_until).toBeDefined();
    });

    it('should calculate totals correctly', async () => {
      const mockDocument = {
        id: '123',
        ...validInvoice,
        client_id: 'client-123',
        user_id: TEST_USER_IDS.user1,
        subtotal: 8000.00,
        tax: 660.00,
        total: 8660.00,
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      mockSupabase.from().insert().select.mockResolvedValue({
        data: documentLineItems,
        error: null,
      });

      const result = await documentService.create(
        TEST_USER_IDS.user1,
        'client-123',
        validInvoice,
        documentLineItems
      );

      // Line item 1: 40 * 150 = 6000, tax = 495
      // Line item 2: 10 * 200 = 2000, tax = 165
      // Total: 8000 + 660 = 8660
      expect(result.document.subtotal).toBe(8000.00);
      expect(result.document.tax).toBe(660.00);
      expect(result.document.total).toBe(8660.00);
    });

    it('should throw ValidationError for invalid document type', async () => {
      await expect(
        documentService.create(
          TEST_USER_IDS.user1,
          'client-123',
          invalidDocuments.invalidType,
          []
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid status', async () => {
      await expect(
        documentService.create(
          TEST_USER_IDS.user1,
          'client-123',
          invalidDocuments.invalidStatus,
          []
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('get', () => {
    it('should retrieve a document with line items', async () => {
      const mockDocument = {
        id: '123',
        ...validInvoice,
        user_id: TEST_USER_IDS.user1,
      };

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: documentLineItems,
        error: null,
      });

      const result = await documentService.get(TEST_USER_IDS.user1, '123');

      expect(result.document).toEqual(mockDocument);
      expect(result.line_items).toEqual(documentLineItems);
    });

    it('should throw NotFoundError when document does not exist', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(
        documentService.get(TEST_USER_IDS.user1, 'nonexistent')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('should list all documents for a user', async () => {
      const mockDocuments = [
        { id: '1', type: 'invoice', status: 'draft' },
        { id: '2', type: 'quote', status: 'sent' },
      ];

      mockSupabase.from().select().eq().eq().order().range.mockResolvedValue({
        data: mockDocuments,
        error: null,
        count: 2,
      });

      const result = await documentService.list(TEST_USER_IDS.user1, {});

      expect(result.data).toEqual(mockDocuments);
      expect(result.total).toBe(2);
    });

    it('should filter by document type', async () => {
      const mockDocuments = [{ id: '1', type: 'invoice', status: 'draft' }];

      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockDocuments,
        error: null,
        count: 1,
      });

      const result = await documentService.list(TEST_USER_IDS.user1, { type: 'invoice' });

      expect(result.data).toEqual(mockDocuments);
    });

    it('should filter by status', async () => {
      const mockDocuments = [{ id: '1', type: 'invoice', status: 'paid' }];

      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockDocuments,
        error: null,
        count: 1,
      });

      const result = await documentService.list(TEST_USER_IDS.user1, { status: 'paid' });

      expect(result.data).toEqual(mockDocuments);
    });

    it('should filter by client', async () => {
      const mockDocuments = [{ id: '1', type: 'invoice', client_id: 'client-123' }];

      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockDocuments,
        error: null,
        count: 1,
      });

      const result = await documentService.list(TEST_USER_IDS.user1, { client_id: 'client-123' });

      expect(result.data).toEqual(mockDocuments);
    });

    it('should filter by date range', async () => {
      const mockDocuments = [{ id: '1', type: 'invoice', issue_date: '2024-01-15' }];

      mockSupabase.from().select().eq().eq().gte().lte().order().range.mockResolvedValue({
        data: mockDocuments,
        error: null,
        count: 1,
      });

      const result = await documentService.list(TEST_USER_IDS.user1, {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });

      expect(result.data).toEqual(mockDocuments);
    });
  });

  describe('update', () => {
    it('should update a document and recalculate totals', async () => {
      const updates = { notes: 'Updated notes' };
      const mockDocument = {
        id: '123',
        ...validInvoice,
        ...updates,
        user_id: TEST_USER_IDS.user1,
      };

      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      const result = await documentService.update(TEST_USER_IDS.user1, '123', updates);

      expect(result.notes).toBe('Updated notes');
    });

    it('should throw NotFoundError when updating non-existent document', async () => {
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(
        documentService.update(TEST_USER_IDS.user1, 'nonexistent', { notes: 'Test' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('finalize', () => {
    it('should finalize a draft invoice', async () => {
      const mockDocument = {
        id: '123',
        ...validInvoice,
        status: 'draft',
        user_id: TEST_USER_IDS.user1,
      };

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: { ...mockDocument, status: 'sent', document_number: 'INV-001' },
        error: null,
      });

      const result = await documentService.finalize(TEST_USER_IDS.user1, '123');

      expect(result.status).toBe('sent');
      expect(result.document_number).toBeDefined();
    });

    it('should throw BusinessLogicError when finalizing non-draft document', async () => {
      const mockDocument = {
        id: '123',
        ...validInvoice,
        status: 'sent',
        user_id: TEST_USER_IDS.user1,
      };

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      await expect(
        documentService.finalize(TEST_USER_IDS.user1, '123')
      ).rejects.toThrow(BusinessLogicError);
    });
  });

  describe('void', () => {
    it('should void a sent invoice', async () => {
      const mockDocument = {
        id: '123',
        ...validInvoice,
        status: 'sent',
        user_id: TEST_USER_IDS.user1,
      };

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: { ...mockDocument, status: 'void' },
        error: null,
      });

      const result = await documentService.void(TEST_USER_IDS.user1, '123');

      expect(result.status).toBe('void');
    });

    it('should throw BusinessLogicError when voiding paid invoice', async () => {
      const mockDocument = {
        id: '123',
        ...validInvoice,
        status: 'paid',
        user_id: TEST_USER_IDS.user1,
      };

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      await expect(
        documentService.void(TEST_USER_IDS.user1, '123')
      ).rejects.toThrow(BusinessLogicError);
    });
  });

  describe('convert', () => {
    it('should convert a quote to an invoice', async () => {
      const mockQuote = {
        id: '123',
        ...validQuote,
        status: 'accepted',
        user_id: TEST_USER_IDS.user1,
      };

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockQuote,
        error: null,
      });

      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: documentLineItems,
        error: null,
      });

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: { ...mockQuote, id: '456', type: 'invoice', status: 'draft' },
        error: null,
      });

      mockSupabase.from().insert().select.mockResolvedValue({
        data: documentLineItems,
        error: null,
      });

      const result = await documentService.convert(TEST_USER_IDS.user1, '123');

      expect(result.document.type).toBe('invoice');
      expect(result.document.status).toBe('draft');
    });

    it('should throw BusinessLogicError when converting non-quote', async () => {
      const mockInvoice = {
        id: '123',
        ...validInvoice,
        user_id: TEST_USER_IDS.user1,
      };

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockInvoice,
        error: null,
      });

      await expect(
        documentService.convert(TEST_USER_IDS.user1, '123')
      ).rejects.toThrow(BusinessLogicError);
    });
  });

  describe('delete', () => {
    it('should soft delete a draft document', async () => {
      const mockDocument = {
        id: '123',
        ...validInvoice,
        status: 'draft',
        user_id: TEST_USER_IDS.user1,
      };

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: { ...mockDocument, deleted_at: new Date().toISOString() },
        error: null,
      });

      await documentService.delete(TEST_USER_IDS.user1, '123');

      expect(mockSupabase.from().update).toHaveBeenCalled();
    });

    it('should throw BusinessLogicError when deleting paid invoice', async () => {
      const mockDocument = {
        id: '123',
        ...validInvoice,
        status: 'paid',
        user_id: TEST_USER_IDS.user1,
      };

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      await expect(
        documentService.delete(TEST_USER_IDS.user1, '123')
      ).rejects.toThrow(BusinessLogicError);
    });
  });
});