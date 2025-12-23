/**
 * Client Service
 * 
 * Business logic for client management operations.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Client } from '../../../shared/types/index.js';
import { NotFoundError, BusinessLogicError, dbErrorToApiError } from '../../../shared/errors/index.js';
import { CreateClientInput, UpdateClientInput, ListClientsQuery } from '../../../shared/schemas/client.schema.js';

export class ClientService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * List clients for a user
   * 
   * @param userId - User ID
   * @param query - Query parameters for filtering and pagination
   * @returns Array of clients
   */
  async list(userId: string, query: ListClientsQuery = {}): Promise<Client[]> {
    try {
      let queryBuilder = this.supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);

      // Filter by archived status
      if (!query.include_archived) {
        queryBuilder = queryBuilder.is('archived_at', null);
      }

      // Search filter
      if (query.search) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query.search}%,email.ilike.%${query.search}%`);
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
   * Get a single client by ID
   * 
   * @param userId - User ID
   * @param id - Client ID
   * @returns Client object
   * @throws NotFoundError if client not found
   */
  async get(userId: string, id: number): Promise<Client> {
    try {
      const { data, error } = await this.supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Client', id);

      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Create a new client
   * 
   * @param userId - User ID
   * @param input - Client data
   * @returns Created client
   */
  async create(userId: string, input: CreateClientInput): Promise<Client> {
    try {
      const { data, error } = await this.supabase
        .from('clients')
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
   * Update a client
   * 
   * @param userId - User ID
   * @param id - Client ID
   * @param input - Updated client data
   * @returns Updated client
   * @throws NotFoundError if client not found
   */
  async update(userId: string, id: number, input: UpdateClientInput): Promise<Client> {
    try {
      const { data, error } = await this.supabase
        .from('clients')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Client', id);

      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Delete (archive) a client
   * 
   * @param userId - User ID
   * @param id - Client ID
   * @throws NotFoundError if client not found
   */
  async delete(userId: string, id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('clients')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Get documents for a client
   * 
   * @param userId - User ID
   * @param clientId - Client ID
   * @returns Array of documents
   */
  async getDocuments(userId: string, clientId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Get projects for a client
   * 
   * @param userId - User ID
   * @param clientId - Client ID
   * @returns Array of projects
   */
  async getProjects(userId: string, clientId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .eq('client_id', clientId)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }
}