/**
 * Client Service
 * 
 * Business logic for client management operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CreateClientInput, UpdateClientInput, ListClientsQuery } from '../schemas/client';

export class ClientService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * List clients with pagination and filtering
   */
  async list(userId: string, query: ListClientsQuery) {
    const { limit = 20, cursor, search, archived, sort = '-created_at' } = query;

    let queryBuilder = this.supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Filter by archived status
    if (archived === 'true') {
      queryBuilder = queryBuilder.not('archived_at', 'is', null);
    } else if (archived === 'false' || !archived) {
      queryBuilder = queryBuilder.is('archived_at', null);
    }

    // Search by name or email
    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply sorting
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortAscending = !sort.startsWith('-');
    queryBuilder = queryBuilder.order(sortField, { ascending: sortAscending });

    // Apply pagination
    if (cursor) {
      const decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString());
      queryBuilder = queryBuilder.gt('id', decodedCursor.id);
    }

    queryBuilder = queryBuilder.limit(limit + 1); // Fetch one extra to check if more exist

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, limit) : data;

    const nextCursor = hasMore && items.length > 0
      ? Buffer.from(JSON.stringify({ id: items[items.length - 1].id })).toString('base64')
      : null;

    const prevCursor = cursor || null;

    return {
      data: items,
      pagination: {
        next_cursor: nextCursor,
        prev_cursor: prevCursor,
        has_more: hasMore,
        total: count || 0
      }
    };
  }

  /**
   * Get a single client by ID
   */
  async get(userId: string, id: number, expand?: string) {
    let query = this.supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Handle expansions
    if (expand && data) {
      const expansions = expand.split(',');
      
      if (expansions.includes('projects')) {
        const { data: projects } = await this.supabase
          .from('projects')
          .select('*')
          .eq('client_id', id)
          .eq('user_id', userId);
        
        (data as any).projects = projects || [];
      }

      if (expansions.includes('documents')) {
        const { data: documents } = await this.supabase
          .from('documents')
          .select('*')
          .eq('client_id', id)
          .eq('user_id', userId);
        
        (data as any).documents = documents || [];
      }
    }

    return data;
  }

  /**
   * Create a new client
   */
  async create(userId: string, input: CreateClientInput) {
    const { data, error } = await this.supabase
      .from('clients')
      .insert({
        ...input,
        user_id: userId,
        default_currency: 'USD'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing client
   */
  async update(userId: string, id: number, input: Partial<UpdateClientInput>) {
    const { data, error } = await this.supabase
      .from('clients')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  /**
   * Delete (archive) a client
   */
  async delete(userId: string, id: number) {
    const { error } = await this.supabase
      .from('clients')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Get projects for a client
   */
  async getProjects(userId: string, clientId: number, status?: string) {
    let query = this.supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .is('archived_at', null);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get documents for a client
   */
  async getDocuments(userId: string, clientId: number, filters: { type?: string; status?: string }) {
    let query = this.supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .is('archived_at', null);

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get notes for a client
   */
  async getNotes(userId: string, clientId: number) {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .eq('entity', 'client')
      .eq('entity_id', clientId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Add a note to a client
   */
  async addNote(userId: string, clientId: number, body: string) {
    const { data, error } = await this.supabase
      .from('notes')
      .insert({
        user_id: userId,
        entity: 'client',
        entity_id: clientId,
        body
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}