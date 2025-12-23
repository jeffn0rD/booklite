/**
 * User Profile Validation Schemas
 * 
 * Zod schemas for validating user profile-related requests.
 */

import { z } from 'zod';
import { addressSchema } from './client.schema.js';

/**
 * Update user profile schema
 */
export const updateUserProfileSchema = z.object({
  business_name: z.string().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: addressSchema.nullable().optional(),
  tax_id: z.string().max(50).optional().nullable(),
  logo_attachment_id: z.number().int().positive().optional().nullable(),
  default_tax_rate_id: z.number().int().positive().optional().nullable(),
  default_payment_terms_days: z.number().int().min(0).max(365).optional(),
  invoice_prefix: z.string().max(20).optional(),
  quote_prefix: z.string().max(20).optional(),
});

/**
 * Type exports
 */
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;