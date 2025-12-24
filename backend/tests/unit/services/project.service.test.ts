/**
 * Project Service Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectService } from '@/features/projects/services/project.service.js';
import { createMockSupabaseClient, TEST_USER_IDS } from '@tests/setup/test-setup.js';
import { validProject, completedProject, invalidProjects } from '@tests/fixtures/projects.js';
import { ValidationError, NotFoundError } from '@/shared/errors/index.js';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    projectService = new ProjectService(mockSupabase);
  });

  describe('create', () => {
    it('should create a project with valid data', async () => {
      const mockProject = { id: '123', ...validProject, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockProject,
        error: null,
      });

      const result = await projectService.create(TEST_USER_IDS.user1, 'client-123', validProject);
      expect(result).toEqual(mockProject);
    });

    it('should throw ValidationError for empty name', async () => {
      await expect(
        projectService.create(TEST_USER_IDS.user1, 'client-123', invalidProjects.emptyName)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid status', async () => {
      await expect(
        projectService.create(TEST_USER_IDS.user1, 'client-123', invalidProjects.invalidStatus)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('get', () => {
    it('should retrieve a project by id', async () => {
      const mockProject = { id: '123', ...validProject, user_id: TEST_USER_IDS.user1 };
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockProject,
        error: null,
      });

      const result = await projectService.get(TEST_USER_IDS.user1, '123');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundError when project does not exist', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(
        projectService.get(TEST_USER_IDS.user1, 'nonexistent')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('should list all projects for a user', async () => {
      const mockProjects = [
        { id: '1', ...validProject, user_id: TEST_USER_IDS.user1 },
        { id: '2', ...completedProject, user_id: TEST_USER_IDS.user1 },
      ];
      mockSupabase.from().select().eq().eq().order().range.mockResolvedValue({
        data: mockProjects,
        error: null,
        count: 2,
      });

      const result = await projectService.list(TEST_USER_IDS.user1, {});
      expect(result.data).toEqual(mockProjects);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      const mockProjects = [{ id: '1', ...validProject, user_id: TEST_USER_IDS.user1 }];
      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockProjects,
        error: null,
        count: 1,
      });

      const result = await projectService.list(TEST_USER_IDS.user1, { status: 'active' });
      expect(result.data).toEqual(mockProjects);
    });

    it('should filter by client', async () => {
      const mockProjects = [{ id: '1', ...validProject, client_id: 'client-123' }];
      mockSupabase.from().select().eq().eq().eq().order().range.mockResolvedValue({
        data: mockProjects,
        error: null,
        count: 1,
      });

      const result = await projectService.list(TEST_USER_IDS.user1, { client_id: 'client-123' });
      expect(result.data).toEqual(mockProjects);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updates = { name: 'Updated Project', status: 'completed' };
      const mockProject = { id: '123', ...validProject, ...updates };
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: mockProject,
        error: null,
      });

      const result = await projectService.update(TEST_USER_IDS.user1, '123', updates);
      expect(result).toEqual(mockProject);
    });
  });

  describe('delete', () => {
    it('should soft delete a project', async () => {
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: { id: '123', deleted_at: new Date().toISOString() },
        error: null,
      });

      await projectService.delete(TEST_USER_IDS.user1, '123');
      expect(mockSupabase.from().update).toHaveBeenCalled();
    });
  });
});