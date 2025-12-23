/**
 * Client Validation Schemas
 * 
 * Zod schemas for validating client-related requests and responses
 */

import { z } from 'zod';

/**
 * Billing Address Schema
 */
export const billingAddressSchema = z.object({
  line1: z.string().max(200).optional(),
  line2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().regex(/^[A-Z]{2}$/, 'Must be ISO 3166-1 alpha-2 country code').optional()
}).optional();

/**
 * Create Client Request Schema
 */
export const createClientSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less'),
  email: z.string()
    .email('Must be a valid email address'),
  billing_address: billingAddressSchema,
  tax_vat_id: z.string()
    .max(50, 'Tax/VAT ID must be 50 characters or less')
    .optional(),
  default_tax_rate_id: z.number()
    .int()
    .positive('Tax rate ID must be positive')
    .optional(),
  default_payment_terms_days: z.number()
    .int()
    .min(0, 'Payment terms must be 0 or greater')
    .max(365, 'Payment terms must be 365 days or less')
    .optional()
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

/**
 * Update Client Request Schema
 */
export const updateClientSchema = createClientSchema;

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

/**
 * Client Response Schema
 */
export const clientSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  billing_address: z.record(z.any()).nullable(),
  tax_vat_id: z.string().nullable(),
  default_tax_rate_id: z.number().int().positive().nullable(),
  default_payment_terms_days: z.number().int().nullable(),
  default_currency: z.literal('USD'),
  archived_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type Client = z.infer<typeof clientSchema>;

/**
 * Client Response Wrapper Schema
 */
export const clientResponseSchema = z.object({
  data: clientSchema,
  meta: z.object({
    timestamp: z.string().datetime(),
    request_id: z.string()
  })
});

/**
 * List Clients Query Parameters Schema
 */
export const listClientsQuerySchema = z.object({
  limit: z.coerce.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .optional(),
  cursor: z.string().optional(),
  search: z.string().optional(),
  archived: z.enum(['true', 'false']).optional(),
  sort: z.string().default('-created_at').optional()
});

export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
  next_cursor: z.string().nullable(),
  prev_cursor: z.string().nullable(),
  has_more: z.boolean(),
  total: z.number().int().optional()
});

/**
 * List Clients Response Schema
 */
export const listClientsResponseSchema = z.object({
  data: z.array(clientSchema),
  pagination: paginationSchema,
  meta: z.object({
    timestamp: z.string().datetime(),
    request_id: z.string()
  })
});