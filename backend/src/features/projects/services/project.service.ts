/**
 * Project Service
 * 
 * Business logic for project management operations.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Project } from '../../../shared/types/index.js';
import { NotFoundError, dbErrorToApiError } from '../../../shared/errors/index.js';
import { CreateProjectInput, UpdateProjectInput, ListProjectsQuery } from '../../../shared/schemas/project.schema.js';

export class ProjectService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * List projects for a user
   */
  async list(userId: string, query: ListProjectsQuery = {}): Promise<Project[]> {
    try {
      let queryBuilder = this.supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);

      // Filter by archived status
      if (!query.include_archived) {
        queryBuilder = queryBuilder.is('archived_at', null);
      }

      // Filter by client
      if (query.client_id) {
        queryBuilder = queryBuilder.eq('client_id', query.client_id);
      }

      // Filter by status
      if (query.status) {
        queryBuilder = queryBuilder.eq('status', query.status);
      }

      // Search filter
      if (query.search) {
        queryBuilder = queryBuilder.ilike('name', `%${query.search}%`);
      }

      // Sorting
      const sortField = query.sort?.startsWith('-') ? query.sort.substring(1) : query.sort || 'created_at';
      const sortOrder = query.sort?.startsWith('-') ? 'asc' : 'desc';
      queryBuilder = queryBuilder.order(sortField, { ascending: sortOrder === 'asc' });

      // Pagination
      if (query.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Get a single project by ID
   */
  async get(userId: string, id: number): Promise<Project> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Project', id);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Create a new project
   */
  async create(userId: string, input: CreateProjectInput): Promise<Project> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .insert({
          ...input,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Update a project
   */
  async update(userId: string, id: number, input: UpdateProjectInput): Promise<Project> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Project', id);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Delete (archive) a project
   */
  async delete(userId: string, id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('projects')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Get documents for a project
   */
  async getDocuments(userId: string, projectId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Get expenses for a project
   */
  async getExpenses(userId: string, projectId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .is('archived_at', null)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }
}