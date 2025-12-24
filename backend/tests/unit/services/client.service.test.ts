/**
 * Client Service Unit Tests
 * 
 * Tests for ClientService business logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClientService } from '@/features/clients/services/client.service.js';
import { createMockSupabaseClient, TEST_USER_IDS } from '@tests/setup/test-setup.js';
import { validClient, validClient2, minimalClient, invalidClients } from '@tests/fixtures/clients.js';
import { ValidationError, NotFoundError, DatabaseError } from '@/shared/errors/index.js';

describe('ClientService', () => {
  let clientService: ClientService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    clientService = new ClientService(mockSupabase);
  });

  describe('create', () => {
    it('should create a client with valid data', async () => {
      const mockClient = { id: '123', ...validClient, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockClient,
        error: null,
      });

      const result = await clientService.create(TEST_USER_IDS.user1, validClient);

      expect(result).toEqual(mockClient);
      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
    });

    it('should create a client with minimal data', async () => {
      const mockClient = { id: '123', ...minimalClient, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockClient,
        error: null,
      });

      const result = await clientService.create(TEST_USER_IDS.user1, minimalClient);

      expect(result).toEqual(mockClient);
    });

    it('should throw ValidationError for empty name', async () => {
      await expect(
        clientService.create(TEST_USER_IDS.user1, invalidClients.emptyName)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid email', async () => {
      await expect(
        clientService.create(TEST_USER_IDS.user1, invalidClients.invalidEmail)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw DatabaseError on database failure', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        clientService.create(TEST_USER_IDS.user1, validClient)
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('get', () => {
    it('should retrieve a client by id', async () => {
      const mockClient = { id: '123', ...validClient, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockClient,
        error: null,
      });

      const result = await clientService.get(TEST_USER_IDS.user1, '123');

      expect(result).toEqual(mockClient);
      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
    });

    it('should throw NotFoundError when client does not exist', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(
        clientService.get(TEST_USER_IDS.user1, 'nonexistent')
      ).rejects.toThrow(NotFoundError);
    });

    it('should enforce user isolation', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(
        clientService.get(TEST_USER_IDS.user2, '123')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('should list all clients for a user', async () => {
      const mockClients = [
        { id: '1', ...validClient, user_id: TEST_USER_IDS.user1 },
        { id: '2', ...validClient2, user_id: TEST_USER_IDS.user1 },
      ];
      mockSupabase.from().select().eq().eq().order().range.mockResolvedValue({
        data: mockClients,
        error: null,
        count: 2,
      });

      const result = await clientService.list(TEST_USER_IDS.user1, {});

      expect(result.data).toEqual(mockClients);
      expect(result.total).toBe(2);
    });

    it('should filter clients by search query', async () => {
      const mockClients = [{ id: '1', ...validClient, user_id: TEST_USER_IDS.user1 }];
      mockSupabase.from().select().eq().eq().ilike().order().range.mockResolvedValue({
        data: mockClients,
        error: null,
        count: 1,
      });

      const result = await clientService.list(TEST_USER_IDS.user1, { search: 'Acme' });

      expect(result.data).toEqual(mockClients);
    });

    it('should filter clients by active status', async () => {
      const mockClients = [{ id: '1', ...validClient, user_id: TEST_USER_IDS.user1 }];
      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockClients,
        error: null,
        count: 1,
      });

      const result = await clientService.list(TEST_USER_IDS.user1, { is_active: true });

      expect(result.data).toEqual(mockClients);
    });

    it('should support pagination', async () => {
      const mockClients = [{ id: '1', ...validClient, user_id: TEST_USER_IDS.user1 }];
      mockSupabase.from().select().eq().eq().order().range.mockResolvedValue({
        data: mockClients,
        error: null,
        count: 10,
      });

      const result = await clientService.list(TEST_USER_IDS.user1, { page: 2, limit: 5 });

      expect(mockSupabase.from().select().eq().eq().order().range).toHaveBeenCalledWith(5, 9);
    });

    it('should support sorting', async () => {
      const mockClients = [{ id: '1', ...validClient, user_id: TEST_USER_IDS.user1 }];
      mockSupabase.from().select().eq().eq().order().range.mockResolvedValue({
        data: mockClients,
        error: null,
        count: 1,
      });

      await clientService.list(TEST_USER_IDS.user1, { sort_by: 'name', sort_order: 'desc' });

      expect(mockSupabase.from().select().eq().eq().order).toHaveBeenCalledWith('name', { ascending: false });
    });
  });

  describe('update', () => {
    it('should update a client with valid data', async () => {
      const updates = { name: 'Updated Name', email: 'updated@test.example.com' };
      const mockClient = { id: '123', ...validClient, ...updates, user_id: TEST_USER_IDS.user1 };
      
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: mockClient,
        error: null,
      });

      const result = await clientService.update(TEST_USER_IDS.user1, '123', updates);

      expect(result).toEqual(mockClient);
    });

    it('should throw NotFoundError when updating non-existent client', async () => {
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(
        clientService.update(TEST_USER_IDS.user1, 'nonexistent', { name: 'Test' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid updates', async () => {
      await expect(
        clientService.update(TEST_USER_IDS.user1, '123', { email: 'invalid-email' })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('delete', () => {
    it('should soft delete a client', async () => {
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: { id: '123', deleted_at: new Date().toISOString() },
        error: null,
      });

      await clientService.delete(TEST_USER_IDS.user1, '123');

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockSupabase.from().update).toHaveBeenCalled();
    });

    it('should throw NotFoundError when deleting non-existent client', async () => {
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(
        clientService.delete(TEST_USER_IDS.user1, 'nonexistent')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getDocuments', () => {
    it('should retrieve all documents for a client', async () => {
      const mockDocuments = [
        { id: '1', type: 'invoice', client_id: '123' },
        { id: '2', type: 'quote', client_id: '123' },
      ];
      mockSupabase.from().select().eq().eq().order.mockResolvedValue({
        data: mockDocuments,
        error: null,
      });

      const result = await clientService.getDocuments(TEST_USER_IDS.user1, '123');

      expect(result).toEqual(mockDocuments);
    });
  });

  describe('getProjects', () => {
    it('should retrieve all projects for a client', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', client_id: '123' },
        { id: '2', name: 'Project 2', client_id: '123' },
      ];
      mockSupabase.from().select().eq().eq().order.mockResolvedValue({
        data: mockProjects,
        error: null,
      });

      const result = await clientService.getProjects(TEST_USER_IDS.user1, '123');

      expect(result).toEqual(mockProjects);
    });
  });
});