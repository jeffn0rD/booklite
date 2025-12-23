/**
 * Payment Validation Schemas
 * 
 * Zod schemas for validating payment-related requests.
 */

import { z } from 'zod';

/**
 * Create payment schema
 */
export const createPaymentSchema = z.object({
  document_id: z.number().int().positive('Document ID is required'),
  amount_cents: z.number().int().positive('Amount must be positive'),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  payment_method: z.string().max(50).optional().nullable(),
  reference_number: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Update payment schema
 */
export const updatePaymentSchema = z.object({
  amount_cents: z.number().int().positive().optional(),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  payment_method: z.string().max(50).optional().nullable(),
  reference_number: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * List payments query schema
 */
export const listPaymentsQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  cursor: z.string().optional(),
  sort: z.string().optional(),
  document_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/**
 * Payment ID param schema
 */
export const paymentIdParamSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

/**
 * Type exports
 */
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
export type PaymentIdParam = z.infer<typeof paymentIdParamSchema>;