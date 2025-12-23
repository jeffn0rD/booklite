/**
 * User Profile Service
 * 
 * Business logic for user profile management operations.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '../../../shared/types/index.js';
import { NotFoundError, dbErrorToApiError } from '../../../shared/errors/index.js';
import { UpdateUserProfileInput } from '../../../shared/schemas/user-profile.schema.js';

export class UserProfileService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get user profile
   */
  async get(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await this.supabase
        .from('user_profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('User Profile', userId);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Update user profile
   */
  async update(userId: string, input: UpdateUserProfileInput): Promise<UserProfile> {
    try {
      const { data, error } = await this.supabase
        .from('user_profile')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('User Profile', userId);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }
}