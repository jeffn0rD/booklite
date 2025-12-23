/**
 * Expense Service
 * 
 * Business logic for expense management operations.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Expense } from '../../../shared/types/index.js';
import { NotFoundError, dbErrorToApiError } from '../../../shared/errors/index.js';
import { CreateExpenseInput, UpdateExpenseInput, ListExpensesQuery } from '../../../shared/schemas/expense.schema.js';

export class ExpenseService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * List expenses for a user
   */
  async list(userId: string, query: ListExpensesQuery = {}): Promise<Expense[]> {
    try {
      let queryBuilder = this.supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId);

      // Filter by archived status
      if (!query.include_archived) {
        queryBuilder = queryBuilder.is('archived_at', null);
      }

      // Filters
      if (query.category_id) {
        queryBuilder = queryBuilder.eq('category_id', query.category_id);
      }
      if (query.project_id) {
        queryBuilder = queryBuilder.eq('project_id', query.project_id);
      }
      if (query.invoice_id) {
        queryBuilder = queryBuilder.eq('invoice_id', query.invoice_id);
      }
      if (query.billable !== undefined) {
        queryBuilder = queryBuilder.eq('billable', query.billable);
      }
      if (query.billed !== undefined) {
        queryBuilder = queryBuilder.eq('billed', query.billed);
      }
      if (query.date_from) {
        queryBuilder = queryBuilder.gte('expense_date', query.date_from);
      }
      if (query.date_to) {
        queryBuilder = queryBuilder.lte('expense_date', query.date_to);
      }

      // Search filter
      if (query.search) {
        queryBuilder = queryBuilder.ilike('description', `%${query.search}%`);
      }

      // Sorting
      const sortField = query.sort?.startsWith('-') ? query.sort.substring(1) : query.sort || 'expense_date';
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
   * Get a single expense by ID
   */
  async get(userId: string, id: number): Promise<Expense> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Expense', id);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Create a new expense
   */
  async create(userId: string, input: CreateExpenseInput): Promise<Expense> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
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
   * Update an expense
   */
  async update(userId: string, id: number, input: UpdateExpenseInput): Promise<Expense> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Expense', id);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Delete (archive) an expense
   */
  async delete(userId: string, id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('expenses')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }
}