/**
 * Client Validation Schemas
 * 
 * Zod schemas for validating client-related requests.
 */

import { z } from 'zod';

/**
 * Address schema
 */
export const addressSchema = z.object({
  line1: z.string().max(200).optional(),
  line2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().regex(/^[A-Z]{2}$/, 'Must be a 2-letter country code').optional(),
}).optional();

/**
 * Create client schema
 */
export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  email: z.string().email('Must be a valid email address').optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  billing_address: addressSchema.nullable().optional(),
  tax_vat_id: z.string().max(50).optional().nullable(),
  default_tax_rate_id: z.number().int().positive().optional().nullable(),
  default_payment_terms_days: z.number().int().min(0).max(365).optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Update client schema (all fields optional)
 */
export const updateClientSchema = createClientSchema.partial();

/**
 * List clients query schema
 */
export const listClientsQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  cursor: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  include_archived: z.string().transform(val => val === 'true').optional(),
});

/**
 * Client ID param schema
 */
export const clientIdParamSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

/**
 * Type exports
 */
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
export type ClientIdParam = z.infer<typeof clientIdParamSchema>;