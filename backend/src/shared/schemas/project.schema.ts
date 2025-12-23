/**
 * Project Validation Schemas
 * 
 * Zod schemas for validating project-related requests.
 */

import { z } from 'zod';

/**
 * Project status enum
 */
export const projectStatusSchema = z.enum(['Active', 'Completed', 'OnHold']);

/**
 * Create project schema
 */
export const createProjectSchema = z.object({
  client_id: z.number().int().positive('Client ID is required'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  status: projectStatusSchema.optional().default('Active'),
  default_po_number: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Update project schema
 */
export const updateProjectSchema = z.object({
  client_id: z.number().int().positive().optional(),
  name: z.string().min(1).max(200).optional(),
  status: projectStatusSchema.optional(),
  default_po_number: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * List projects query schema
 */
export const listProjectsQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  cursor: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  client_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  status: projectStatusSchema.optional(),
  include_archived: z.string().transform(val => val === 'true').optional(),
});

/**
 * Project ID param schema
 */
export const projectIdParamSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

/**
 * Type exports
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;