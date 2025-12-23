/**
 * Category Validation Schemas
 * 
 * Zod schemas for validating category-related requests.
 */

import { z } from 'zod';

/**
 * Create category schema
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').optional().nullable(),
});

/**
 * Update category schema
 */
export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().nullable(),
});

/**
 * List categories query schema
 */
export const listCategoriesQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  cursor: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
});

/**
 * Category ID param schema
 */
export const categoryIdParamSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

/**
 * Type exports
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;