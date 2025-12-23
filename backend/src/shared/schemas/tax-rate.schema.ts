/**
 * Tax Rate Validation Schemas
 * 
 * Zod schemas for validating tax rate-related requests.
 */

import { z } from 'zod';

/**
 * Create tax rate schema
 */
export const createTaxRateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  rate: z.number().min(0, 'Rate must be non-negative').max(100, 'Rate must be 100 or less'),
  description: z.string().optional().nullable(),
});

/**
 * Update tax rate schema
 */
export const updateTaxRateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  rate: z.number().min(0).max(100).optional(),
  description: z.string().optional().nullable(),
});

/**
 * List tax rates query schema
 */
export const listTaxRatesQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  cursor: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
});

/**
 * Tax rate ID param schema
 */
export const taxRateIdParamSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

/**
 * Type exports
 */
export type CreateTaxRateInput = z.infer<typeof createTaxRateSchema>;
export type UpdateTaxRateInput = z.infer<typeof updateTaxRateSchema>;
export type ListTaxRatesQuery = z.infer<typeof listTaxRatesQuerySchema>;
export type TaxRateIdParam = z.infer<typeof taxRateIdParamSchema>;