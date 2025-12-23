/**
 * Category Service
 * 
 * Business logic for category management operations.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Category } from '../../../shared/types/index.js';
import { NotFoundError, dbErrorToApiError } from '../../../shared/errors/index.js';
import { CreateCategoryInput, UpdateCategoryInput, ListCategoriesQuery } from '../../../shared/schemas/category.schema.js';

export class CategoryService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * List categories for a user
   */
  async list(userId: string, query: ListCategoriesQuery = {}): Promise<Category[]> {
    try {
      let queryBuilder = this.supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      // Search filter
      if (query.search) {
        queryBuilder = queryBuilder.ilike('name', `%${query.search}%`);
      }

      // Sorting
      const sortField = query.sort?.startsWith('-') ? query.sort.substring(1) : query.sort || 'name';
      const sortOrder = query.sort?.startsWith('-') ? 'asc' : 'asc';
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
   * Get a single category by ID
   */
  async get(userId: string, id: number): Promise<Category> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Category', id);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Create a new category
   */
  async create(userId: string, input: CreateCategoryInput): Promise<Category> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
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
   * Update a category
   */
  async update(userId: string, id: number, input: UpdateCategoryInput): Promise<Category> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Category', id);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Delete a category
   */
  async delete(userId: string, id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }
}