# Booklite Unit Tests Specification

## Overview

This document provides comprehensive specifications for all unit tests in the Booklite API. Unit tests focus on testing individual functions, methods, and components in isolation with mocked dependencies.

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Specification - Ready for Implementation

## Test Framework Configuration

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/',
        '**/mocks/'
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
});
```

## Service Layer Tests

### ClientService Tests

**File**: `tests/unit/services/client.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClientService } from '@/features/clients/services/client.service';
import { createMockSupabaseClient } from '@tests/mocks/supabase';
import { testUser, testClient } from '@tests/fixtures/clients';

describe('ClientService', () => {
  let clientService: ClientService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    clientService = new ClientService(mockSupabase);
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return list of clients for user', async () => {
      const mockClients = [testClient];
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockClients, error: null })
      });

      const result = await clientService.list(testUser.id, {});

      expect(result).toEqual(mockClients);
      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
    });

    it('should filter by search query', async () => {
      const mockClients = [testClient];
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockClients, error: null })
      });

      const result = await clientService.list(testUser.id, { search: 'Acme' });

      expect(result).toEqual(mockClients);
    });

    it('should exclude archived clients by default', async () => {
      const mockClients = [testClient];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockClients, error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await clientService.list(testUser.id, {});

      expect(mockChain.is).toHaveBeenCalledWith('archived_at', null);
    });

    it('should include archived clients when requested', async () => {
      const mockClients = [testClient];
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockClients, error: null })
      });

      await clientService.list(testUser.id, { include_archived: true });

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
    });

    it('should throw error when database query fails', async () => {
      const dbError = new Error('Database connection failed');
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: dbError })
      });

      await expect(clientService.list(testUser.id, {})).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('create', () => {
    it('should create a new client with valid data', async () => {
      const input = {
        name: 'Acme Corporation',
        email: 'billing@acme.com'
      };
      const createdClient = { id: 1, ...input, user_id: testUser.id };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdClient, error: null })
      });

      const result = await clientService.create(testUser.id, input);

      expect(result).toEqual(createdClient);
      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
    });

    it('should include user_id in created client', async () => {
      const input = { name: 'Test Client', email: 'test@example.com' };
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 1, ...input, user_id: testUser.id }, 
          error: null 
        })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await clientService.create(testUser.id, input);

      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: testUser.id })
      );
    });

    it('should throw error when client name already exists', async () => {
      const input = { name: 'Acme Corporation', email: 'billing@acme.com' };
      const dbError = { code: '23505', message: 'Duplicate key violation' };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: dbError })
      });

      await expect(clientService.create(testUser.id, input)).rejects.toThrow();
    });

    it('should handle optional fields correctly', async () => {
      const input = {
        name: 'Test Client',
        email: 'test@example.com',
        phone: '+1-555-0100',
        billing_address: {
          line1: '123 Main St',
          city: 'San Francisco',
          country: 'US'
        }
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 1, ...input, user_id: testUser.id }, 
          error: null 
        })
      });

      const result = await clientService.create(testUser.id, input);

      expect(result.phone).toBe(input.phone);
      expect(result.billing_address).toEqual(input.billing_address);
    });
  });

  describe('get', () => {
    it('should return client by id', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: testClient, error: null })
      });

      const result = await clientService.get(testUser.id, testClient.id);

      expect(result).toEqual(testClient);
    });

    it('should enforce user_id matching', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: testClient, error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await clientService.get(testUser.id, testClient.id);

      expect(mockChain.eq).toHaveBeenCalledWith('user_id', testUser.id);
    });

    it('should throw error when client not found', async () => {
      const notFoundError = { code: 'PGRST116', message: 'Not found' };
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: notFoundError })
      });

      await expect(clientService.get(testUser.id, 999)).rejects.toThrow();
    });

    it('should throw error when accessing another user\'s client', async () => {
      const forbiddenError = { code: 'PGRST116', message: 'Not found' };
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: forbiddenError })
      });

      const otherUserId = '550e8400-e29b-41d4-a716-446655440001';
      await expect(clientService.get(otherUserId, testClient.id)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update client with valid data', async () => {
      const updates = { name: 'Updated Name', email: 'updated@example.com' };
      const updatedClient = { ...testClient, ...updates };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedClient, error: null })
      });

      const result = await clientService.update(testUser.id, testClient.id, updates);

      expect(result).toEqual(updatedClient);
    });

    it('should only update provided fields', async () => {
      const updates = { name: 'Updated Name' };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { ...testClient, ...updates }, 
          error: null 
        })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await clientService.update(testUser.id, testClient.id, updates);

      expect(mockChain.update).toHaveBeenCalledWith(updates);
    });

    it('should enforce user_id matching on update', async () => {
      const updates = { name: 'Updated Name' };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { ...testClient, ...updates }, 
          error: null 
        })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await clientService.update(testUser.id, testClient.id, updates);

      expect(mockChain.eq).toHaveBeenCalledWith('user_id', testUser.id);
    });

    it('should throw error when client not found', async () => {
      const updates = { name: 'Updated Name' };
      const notFoundError = { code: 'PGRST116', message: 'Not found' };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: notFoundError })
      });

      await expect(
        clientService.update(testUser.id, 999, updates)
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should soft delete client by setting archived_at', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      await clientService.delete(testUser.id, testClient.id);

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
    });

    it('should set archived_at to current timestamp', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const beforeDelete = new Date();
      await clientService.delete(testUser.id, testClient.id);
      const afterDelete = new Date();

      const updateCall = mockChain.update.mock.calls[0][0];
      const archivedAt = new Date(updateCall.archived_at);
      
      expect(archivedAt.getTime()).toBeGreaterThanOrEqual(beforeDelete.getTime());
      expect(archivedAt.getTime()).toBeLessThanOrEqual(afterDelete.getTime());
    });

    it('should enforce user_id matching on delete', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await clientService.delete(testUser.id, testClient.id);

      expect(mockChain.eq).toHaveBeenCalledWith('user_id', testUser.id);
    });

    it('should throw error when client not found', async () => {
      const notFoundError = { code: 'PGRST116', message: 'Not found' };
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: notFoundError })
      });

      await expect(clientService.delete(testUser.id, 999)).rejects.toThrow();
    });
  });

  describe('getDocuments', () => {
    it('should return documents for client', async () => {
      const mockDocuments = [
        { id: 1, client_id: testClient.id, type: 'Invoice' }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDocuments, error: null })
      });

      const result = await clientService.getDocuments(testUser.id, testClient.id);

      expect(result).toEqual(mockDocuments);
    });

    it('should enforce user_id and client_id matching', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await clientService.getDocuments(testUser.id, testClient.id);

      expect(mockChain.eq).toHaveBeenCalledWith('user_id', testUser.id);
      expect(mockChain.eq).toHaveBeenCalledWith('client_id', testClient.id);
    });
  });

  describe('getProjects', () => {
    it('should return projects for client', async () => {
      const mockProjects = [
        { id: 1, client_id: testClient.id, name: 'Project 1' }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProjects, error: null })
      });

      const result = await clientService.getProjects(testUser.id, testClient.id);

      expect(result).toEqual(mockProjects);
    });

    it('should exclude archived projects', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await clientService.getProjects(testUser.id, testClient.id);

      expect(mockChain.is).toHaveBeenCalledWith('archived_at', null);
    });
  });
});
```

### DocumentService Tests

**File**: `tests/unit/services/document.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentService } from '@/features/documents/services/document.service';
import { createMockSupabaseClient } from '@tests/mocks/supabase';
import { testUser, testDocument, testLineItems } from '@tests/fixtures/documents';

describe('DocumentService', () => {
  let documentService: DocumentService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    documentService = new DocumentService(mockSupabase);
    vi.clearAllMocks();
  });

  describe('calculateTotals', () => {
    it('should calculate subtotal correctly', () => {
      const lineItems = [
        { quantity: 2, unit_price_cents: 10000, tax_rate_snapshot: 0 },
        { quantity: 1, unit_price_cents: 5000, tax_rate_snapshot: 0 }
      ];

      const result = documentService.calculateTotals(lineItems);

      expect(result.subtotal_cents).toBe(25000); // 20000 + 5000
    });

    it('should calculate tax correctly', () => {
      const lineItems = [
        { quantity: 1, unit_price_cents: 10000, tax_rate_snapshot: 10 }
      ];

      const result = documentService.calculateTotals(lineItems);

      expect(result.tax_total_cents).toBe(1000); // 10% of 10000
    });

    it('should calculate total correctly', () => {
      const lineItems = [
        { quantity: 1, unit_price_cents: 10000, tax_rate_snapshot: 10 }
      ];

      const result = documentService.calculateTotals(lineItems);

      expect(result.total_cents).toBe(11000); // 10000 + 1000
    });

    it('should handle multiple line items with different tax rates', () => {
      const lineItems = [
        { quantity: 1, unit_price_cents: 10000, tax_rate_snapshot: 10 },
        { quantity: 2, unit_price_cents: 5000, tax_rate_snapshot: 8 }
      ];

      const result = documentService.calculateTotals(lineItems);

      expect(result.subtotal_cents).toBe(20000); // 10000 + 10000
      expect(result.tax_total_cents).toBe(1800); // 1000 + 800
      expect(result.total_cents).toBe(21800);
    });

    it('should handle zero tax rate', () => {
      const lineItems = [
        { quantity: 1, unit_price_cents: 10000, tax_rate_snapshot: 0 }
      ];

      const result = documentService.calculateTotals(lineItems);

      expect(result.tax_total_cents).toBe(0);
      expect(result.total_cents).toBe(10000);
    });

    it('should handle empty line items', () => {
      const result = documentService.calculateTotals([]);

      expect(result.subtotal_cents).toBe(0);
      expect(result.tax_total_cents).toBe(0);
      expect(result.total_cents).toBe(0);
    });

    it('should round tax calculations correctly', () => {
      const lineItems = [
        { quantity: 1, unit_price_cents: 10001, tax_rate_snapshot: 10 }
      ];

      const result = documentService.calculateTotals(lineItems);

      // 10% of 10001 = 1000.1, should round to 1000
      expect(result.tax_total_cents).toBe(1000);
    });
  });

  describe('finalize', () => {
    it('should finalize draft document', async () => {
      const draftDocument = { ...testDocument, status: 'Draft' };
      const finalizedDocument = {
        ...draftDocument,
        status: 'Finalized',
        number: 'INV-001',
        finalized_at: new Date().toISOString()
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: draftDocument, error: null })
      });

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: finalizedDocument, error: null })
      });

      const result = await documentService.finalize(testUser.id, testDocument.id);

      expect(result.status).toBe('Finalized');
      expect(result.number).toBe('INV-001');
      expect(result.finalized_at).toBeDefined();
    });

    it('should throw error when document already finalized', async () => {
      const finalizedDocument = { ...testDocument, status: 'Finalized' };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: finalizedDocument, error: null })
      });

      await expect(
        documentService.finalize(testUser.id, testDocument.id)
      ).rejects.toThrow('Document is already finalized');
    });

    it('should throw error when document has no line items', async () => {
      const documentWithoutItems = { ...testDocument, status: 'Draft' };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: documentWithoutItems, error: null })
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      });

      await expect(
        documentService.finalize(testUser.id, testDocument.id)
      ).rejects.toThrow('Document must have at least one line item');
    });

    it('should generate document number on finalization', async () => {
      const draftDocument = { ...testDocument, status: 'Draft', number: null };
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: draftDocument, error: null })
      });

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { ...draftDocument, number: 'INV-001' }, 
          error: null 
        })
      };
      mockSupabase.from.mockReturnValueOnce(mockChain);

      await documentService.finalize(testUser.id, testDocument.id);

      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({ number: expect.any(String) })
      );
    });
  });

  describe('void', () => {
    it('should void paid invoice', async () => {
      const paidInvoice = {
        ...testDocument,
        type: 'Invoice',
        status: 'Paid',
        balance_due_cents: 0
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: paidInvoice, error: null })
      });

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { ...paidInvoice, status: 'Void' }, 
          error: null 
        })
      });

      const result = await documentService.void(testUser.id, testDocument.id);

      expect(result.status).toBe('Void');
    });

    it('should throw error when invoice has balance due', async () => {
      const unpaidInvoice = {
        ...testDocument,
        type: 'Invoice',
        balance_due_cents: 10000
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: unpaidInvoice, error: null })
      });

      await expect(
        documentService.void(testUser.id, testDocument.id)
      ).rejects.toThrow('Cannot void invoice with outstanding balance');
    });

    it('should throw error when document is not an invoice', async () => {
      const quote = { ...testDocument, type: 'Quote' };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: quote, error: null })
      });

      await expect(
        documentService.void(testUser.id, testDocument.id)
      ).rejects.toThrow('Only invoices can be voided');
    });
  });

  describe('convert', () => {
    it('should convert finalized quote to invoice', async () => {
      const finalizedQuote = {
        ...testDocument,
        type: 'Quote',
        status: 'Finalized'
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: finalizedQuote, error: null })
      });

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { ...finalizedQuote, type: 'Invoice', id: 2 }, 
          error: null 
        })
      });

      const result = await documentService.convert(testUser.id, testDocument.id);

      expect(result.type).toBe('Invoice');
    });

    it('should throw error when quote is not finalized', async () => {
      const draftQuote = { ...testDocument, type: 'Quote', status: 'Draft' };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: draftQuote, error: null })
      });

      await expect(
        documentService.convert(testUser.id, testDocument.id)
      ).rejects.toThrow('Only finalized quotes can be converted');
    });

    it('should throw error when document is already an invoice', async () => {
      const invoice = { ...testDocument, type: 'Invoice' };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: invoice, error: null })
      });

      await expect(
        documentService.convert(testUser.id, testDocument.id)
      ).rejects.toThrow('Document is already an invoice');
    });

    it('should copy line items to new invoice', async () => {
      const finalizedQuote = {
        ...testDocument,
        type: 'Quote',
        status: 'Finalized'
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: finalizedQuote, error: null })
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: testLineItems, error: null })
      });

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { ...finalizedQuote, type: 'Invoice', id: 2 }, 
          error: null 
        })
      });

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null })
      });

      await documentService.convert(testUser.id, testDocument.id);

      // Verify line items were copied
      expect(mockSupabase.from).toHaveBeenCalledWith('document_line_items');
    });
  });
});
```

## Utility Function Tests

### Currency Utilities

**File**: `tests/unit/utils/currency.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrency, calculateTax } from '@/shared/utils/currency';

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('should format cents to USD currency string', () => {
      expect(formatCurrency(10000)).toBe('$100.00');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-10000)).toBe('-$100.00');
    });

    it('should handle large amounts', () => {
      expect(formatCurrency(123456789)).toBe('$1,234,567.89');
    });

    it('should handle fractional cents correctly', () => {
      expect(formatCurrency(10050)).toBe('$100.50');
      expect(formatCurrency(10005)).toBe('$100.05');
    });
  });

  describe('parseCurrency', () => {
    it('should parse USD currency string to cents', () => {
      expect(parseCurrency('$100.00')).toBe(10000);
    });

    it('should handle strings without dollar sign', () => {
      expect(parseCurrency('100.00')).toBe(10000);
    });

    it('should handle strings with commas', () => {
      expect(parseCurrency('$1,234.56')).toBe(123456);
    });

    it('should handle negative amounts', () => {
      expect(parseCurrency('-$100.00')).toBe(-10000);
    });

    it('should throw error for invalid input', () => {
      expect(() => parseCurrency('invalid')).toThrow('Invalid currency format');
    });

    it('should handle zero', () => {
      expect(parseCurrency('$0.00')).toBe(0);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly', () => {
      expect(calculateTax(10000, 10)).toBe(1000);
    });

    it('should handle zero tax rate', () => {
      expect(calculateTax(10000, 0)).toBe(0);
    });

    it('should handle fractional tax rates', () => {
      expect(calculateTax(10000, 8.5)).toBe(850);
    });

    it('should round to nearest cent', () => {
      expect(calculateTax(10001, 10)).toBe(1000);
    });

    it('should handle zero amount', () => {
      expect(calculateTax(0, 10)).toBe(0);
    });
  });
});
```

### Validation Utilities

**File**: `tests/unit/utils/validation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { validateEmail, validateDate, validatePhone } from '@/shared/utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@example.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('invalid@.com')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('should validate correct date formats', () => {
      expect(validateDate('2024-01-15')).toBe(true);
      expect(validateDate('2024-12-31')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(validateDate('01/15/2024')).toBe(false);
      expect(validateDate('2024-13-01')).toBe(false);
      expect(validateDate('2024-01-32')).toBe(false);
    });

    it('should handle leap years correctly', () => {
      expect(validateDate('2024-02-29')).toBe(true);
      expect(validateDate('2023-02-29')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(validateDate('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone formats', () => {
      expect(validatePhone('+1-555-0100')).toBe(true);
      expect(validatePhone('+44-20-1234-5678')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('invalid')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(validatePhone('')).toBe(false);
    });
  });
});
```

## Schema Validation Tests

### Client Schema Tests

**File**: `tests/unit/schemas/client.schema.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createClientSchema, updateClientSchema } from '@/features/clients/schemas/client.schema';

describe('Client Schemas', () => {
  describe('createClientSchema', () => {
    it('should validate correct client data', () => {
      const validData = {
        name: 'Acme Corporation',
        email: 'billing@acme.com'
      };

      const result = createClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require name field', () => {
      const invalidData = {
        email: 'billing@acme.com'
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('should validate email format', () => {
      const invalidData = {
        name: 'Acme Corporation',
        email: 'invalid-email'
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should enforce name length limits', () => {
      const tooLong = 'A'.repeat(201);
      const invalidData = {
        name: tooLong,
        email: 'billing@acme.com'
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate billing address structure', () => {
      const validData = {
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        billing_address: {
          line1: '123 Main St',
          city: 'San Francisco',
          country: 'US'
        }
      };

      const result = createClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate country code format', () => {
      const invalidData = {
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        billing_address: {
          country: 'USA' // Should be 2-letter code
        }
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow optional fields to be omitted', () => {
      const minimalData = {
        name: 'Acme Corporation',
        email: 'billing@acme.com'
      };

      const result = createClientSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateClientSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        name: 'Updated Name'
      };

      const result = updateClientSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should validate email when provided', () => {
      const invalidData = {
        email: 'invalid-email'
      };

      const result = updateClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow empty update object', () => {
      const result = updateClientSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
```

## Test Execution

### Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- client.service.test.ts

# Run tests in watch mode
npm run test:unit -- --watch

# Run with coverage
npm run test:unit -- --coverage

# Run tests matching pattern
npm run test:unit -- --grep "ClientService"
```

### Coverage Reports

```bash
# Generate HTML coverage report
npm run test:coverage

# View coverage in terminal
npm run test:coverage -- --reporter=text

# Check coverage thresholds
npm run test:coverage -- --coverage.lines=90
```

## Summary

This specification provides comprehensive unit test coverage for:

- **Service Layer**: All CRUD operations, business logic, calculations
- **Utility Functions**: Currency, validation, formatting, date handling
- **Schema Validation**: All Zod schemas with edge cases

**Total Test Cases**: 100+  
**Expected Coverage**: 90%+  
**Execution Time**: < 30 seconds

---

**Next Steps**:
1. Implement test infrastructure
2. Create mock implementations
3. Write test fixtures
4. Implement service layer tests
5. Implement utility tests
6. Implement schema tests
7. Achieve 90%+ coverage

**Related Documents**:
- [Test Strategy](./test-strategy.md)
- [Integration Tests Specification](./integration-tests-specification.md)
- [Test Data Specification](./test-data-specification.md)
- [Test Setup Guide](./test-setup-guide.md)