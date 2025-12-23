/**
 * Expense Validation Schemas
 * 
 * Zod schemas for validating expense-related requests.
 */

import { z } from 'zod';

/**
 * Create expense schema
 */
export const createExpenseSchema = z.object({
  category_id: z.number().int().positive().optional().nullable(),
  project_id: z.number().int().positive().optional().nullable(),
  invoice_id: z.number().int().positive().optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  amount_cents: z.number().int().positive('Amount must be positive'),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  receipt_attachment_id: z.number().int().positive().optional().nullable(),
  billable: z.boolean().optional().default(false),
  billed: z.boolean().optional().default(false),
  notes: z.string().optional().nullable(),
});

/**
 * Update expense schema
 */
export const updateExpenseSchema = z.object({
  category_id: z.number().int().positive().optional().nullable(),
  project_id: z.number().int().positive().optional().nullable(),
  invoice_id: z.number().int().positive().optional().nullable(),
  description: z.string().min(1).optional(),
  amount_cents: z.number().int().positive().optional(),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  receipt_attachment_id: z.number().int().positive().optional().nullable(),
  billable: z.boolean().optional(),
  billed: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

/**
 * List expenses query schema
 */
export const listExpensesQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  cursor: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  category_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  project_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  invoice_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  billable: z.string().transform(val => val === 'true').optional(),
  billed: z.string().transform(val => val === 'true').optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  include_archived: z.string().transform(val => val === 'true').optional(),
});

/**
 * Expense ID param schema
 */
export const expenseIdParamSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

/**
 * Type exports
 */
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
export type ExpenseIdParam = z.infer<typeof expenseIdParamSchema>;