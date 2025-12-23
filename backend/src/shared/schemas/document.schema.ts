/**
 * Document Validation Schemas
 * 
 * Zod schemas for validating document-related requests.
 */

import { z } from 'zod';

/**
 * Document type enum
 */
export const documentTypeSchema = z.enum(['Quote', 'Invoice']);

/**
 * Document status enum
 */
export const documentStatusSchema = z.enum([
  'Draft',
  'Finalized',
  'Sent',
  'Paid',
  'Partial',
  'Overdue',
  'Void',
]);

/**
 * Line item schema
 */
export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price_cents: z.number().int().nonnegative('Unit price must be non-negative'),
  tax_rate_id: z.number().int().positive().optional().nullable(),
  sort_order: z.number().int().nonnegative().optional(),
});

/**
 * Create document schema
 */
export const createDocumentSchema = z.object({
  client_id: z.number().int().positive('Client ID is required'),
  project_id: z.number().int().positive().optional().nullable(),
  type: documentTypeSchema,
  po_number: z.string().max(100).optional().nullable(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional().nullable(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required').optional(),
});

/**
 * Update document schema
 */
export const updateDocumentSchema = z.object({
  client_id: z.number().int().positive().optional(),
  project_id: z.number().int().positive().optional().nullable(),
  po_number: z.string().max(100).optional().nullable(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  line_items: z.array(lineItemSchema).optional(),
});

/**
 * Finalize document schema
 */
export const finalizeDocumentSchema = z.object({
  send_email: z.boolean().optional(),
});

/**
 * Send document schema
 */
export const sendDocumentSchema = z.object({
  to: z.string().email().optional(),
  cc: z.array(z.string().email()).optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
});

/**
 * List documents query schema
 */
export const listDocumentsQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  cursor: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  type: documentTypeSchema.optional(),
  status: documentStatusSchema.optional(),
  client_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  project_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  include_archived: z.string().transform(val => val === 'true').optional(),
});

/**
 * Document ID param schema
 */
export const documentIdParamSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

/**
 * Type exports
 */
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type FinalizeDocumentInput = z.infer<typeof finalizeDocumentSchema>;
export type SendDocumentInput = z.infer<typeof sendDocumentSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;
export type LineItemInput = z.infer<typeof lineItemSchema>;