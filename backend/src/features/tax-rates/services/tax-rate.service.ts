/**
 * Tax Rate Service
 * 
 * Business logic for tax rate management operations.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { TaxRate } from '../../../shared/types/index.js';
import { NotFoundError, dbErrorToApiError } from '../../../shared/errors/index.js';
import { CreateTaxRateInput, UpdateTaxRateInput, ListTaxRatesQuery } from '../../../shared/schemas/tax-rate.schema.js';

export class TaxRateService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * List tax rates for a user
   */
  async list(userId: string, query: ListTaxRatesQuery = {}): Promise<TaxRate[]> {
    try {
      let queryBuilder = this.supabase
        .from('tax_rates')
        .select('*')
        .eq('user_id', userId);

      // Search filter
      if (query.search) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query.search}%,description.ilike.%${query.search}%`);
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
   * Get a single tax rate by ID
   */
  async get(userId: string, id: number): Promise<TaxRate> {
    try {
      const { data, error } = await this.supabase
        .from('tax_rates')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Tax Rate', id);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Create a new tax rate
   */
  async create(userId: string, input: CreateTaxRateInput): Promise<TaxRate> {
    try {
      const { data, error } = await this.supabase
        .from('tax_rates')
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
   * Update a tax rate
   */
  async update(userId: string, id: number, input: UpdateTaxRateInput): Promise<TaxRate> {
    try {
      const { data, error } = await this.supabase
        .from('tax_rates')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Tax Rate', id);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Delete a tax rate
   */
  async delete(userId: string, id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('tax_rates')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }
}