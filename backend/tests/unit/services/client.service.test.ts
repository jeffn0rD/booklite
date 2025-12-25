/**
 * Client Service Unit Tests
 * 
 * Tests for ClientService business logic using simple mocks.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClientService } from '@/features/clients/services/client.service.js';
import { TEST_USER_IDS } from '@tests/setup/test-setup.js';
import { createSimpleMockSupabase, createErrorMockSupabase, createEmptyMockSupabase } from '@tests/helpers/mock-helpers.js';
import { validClient, validClient2, minimalClient } from '@tests/fixtures/clients.js';
import { NotFoundError } from '@/shared/errors/index.js';

describe('ClientService', () => {
  let clientService: ClientService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createSimpleMockSupabase({
      name: validClient.name,
      email: validClient.email,
      company: validClient.company,
      phone: validClient.phone,
      address: validClient.address,
      city: validClient.city,
      state: validClient.state,
      postal_code: validClient.postal_code,
      country: validClient.country,
      tax_id: validClient.tax_id,
      notes: validClient.notes,
      is_active: true,
    });
    clientService = new ClientService(mockSupabase);
  });

  describe('create', () => {
    it('should create a client with valid data', async () => {
      const result = await clientService.create(TEST_USER_IDS.user1, validClient);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(validClient.name);
      expect(result.email).toBe(validClient.email);
      expect(result.user_id).toBe(TEST_USER_IDS.user1);
    });

    it('should create a client with minimal data', async () => {
      mockSupabase = createSimpleMockSupabase({
        name: minimalClient.name,
      });
      clientService = new ClientService(mockSupabase);
      
      const result = await clientService.create(TEST_USER_IDS.user1, minimalClient);
      
      expect(result.name).toBe(minimalClient.name);
      expect(result.user_id).toBe(TEST_USER_IDS.user1);
    });

    it('should handle database errors', async () => {
      mockSupabase = createErrorMockSupabase('Unique constraint violation', '23505');
      clientService = new ClientService(mockSupabase);

      await expect(
        clientService.create(TEST_USER_IDS.user1, validClient)
      ).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should retrieve a client by id', async () => {
      const result = await clientService.get(TEST_USER_IDS.user1, 123);
      
      expect(result).toBeDefined();
      expect(result.name).toBe(validClient.name);
    });

    it('should throw NotFoundError for non-existent client', async () => {
      mockSupabase = createEmptyMockSupabase();
      clientService = new ClientService(mockSupabase);

      await expect(
        clientService.get(TEST_USER_IDS.user1, 999)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('should list all clients for a user', async () => {
      const result = await clientService.list(TEST_USER_IDS.user1, {});
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter clients by search query', async () => {
      const result = await clientService.list(TEST_USER_IDS.user1, {
        search: 'Acme',
      });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty results', async () => {
      mockSupabase = createEmptyMockSupabase();
      clientService = new ClientService(mockSupabase);
      
      const result = await clientService.list(TEST_USER_IDS.user1, {});
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should support pagination', async () => {
      const result = await clientService.list(TEST_USER_IDS.user1, {
        limit: 10,
      });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should support sorting', async () => {
      const result = await clientService.list(TEST_USER_IDS.user1, {
        sort: 'name',
      });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a client with valid data', async () => {
      const updates = { name: 'Updated Client', email: 'updated@example.com' };
      mockSupabase = createSimpleMockSupabase({
        ...validClient,
        ...updates,
      });
      clientService = new ClientService(mockSupabase);
      
      const result = await clientService.update(TEST_USER_IDS.user1, 123, updates);
      
      expect(result.name).toBe(updates.name);
      expect(result.email).toBe(updates.email);
    });

    it('should throw NotFoundError when updating non-existent client', async () => {
      mockSupabase = createEmptyMockSupabase();
      clientService = new ClientService(mockSupabase);

      await expect(
        clientService.update(TEST_USER_IDS.user1, 999, { name: 'Updated' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete a client', async () => {
      await expect(
        clientService.delete(TEST_USER_IDS.user1, 123)
      ).resolves.not.toThrow();
    });

    it('should handle errors during deletion', async () => {
      mockSupabase = createErrorMockSupabase('Foreign key constraint', '23503');
      clientService = new ClientService(mockSupabase);

      await expect(
        clientService.delete(TEST_USER_IDS.user1, 123)
      ).rejects.toThrow();
    });
  });

  describe('getDocuments', () => {
    it('should retrieve all documents for a client', async () => {
      const result = await clientService.getDocuments(TEST_USER_IDS.user1, 123);
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getProjects', () => {
    it('should retrieve all projects for a client', async () => {
      const result = await clientService.getProjects(TEST_USER_IDS.user1, 123);
      
      expect(Array.isArray(result)).toBe(true);
    });
  });
});