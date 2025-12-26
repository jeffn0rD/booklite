/**
 * Expense Test Fixtures
 * 
 * Predefined test data for expense-related tests.
 * All fixtures match the database schema exactly.
 * 
 * Note: All amounts are in CENTS (multiply dollars by 100).
 */

import type { CreateExpenseInput } from '@/shared/schemas/expense.schema';

export const validExpense: CreateExpenseInput = {
  date: '2024-01-15',
  vendor: 'Office Depot',
  total_amount_cents: 15000, // $150.00
  tax_amount_cents: 1238, // $12.38 (8.25% tax)
  currency: 'USD',
  notes: 'Monthly office supplies',
  billable: false,
  billing_status: 'unbilled',
};

export const billableExpense: CreateExpenseInput = {
  date: '2024-01-20',
  vendor: 'United Airlines',
  total_amount_cents: 50000, // $500.00
  tax_amount_cents: 0,
  currency: 'USD',
  notes: 'Client meeting travel',
  billable: true,
  billing_status: 'unbilled',
};

export const recurringExpense: CreateExpenseInput = {
  date: '2024-01-01',
  vendor: 'Adobe',
  total_amount_cents: 9900, // $99.00
  tax_amount_cents: 817, // $8.17 (8.25% tax)
  currency: 'USD',
  notes: 'Monthly software subscription',
  billable: false,
  billing_status: 'unbilled',
};

export const expenseWithReceipt: CreateExpenseInput = {
  date: '2024-01-15',
  vendor: 'Amazon',
  total_amount_cents: 25000, // $250.00
  tax_amount_cents: 2063, // $20.63 (8.25% tax)
  currency: 'USD',
  notes: 'Computer equipment',
  billable: false,
  billing_status: 'unbilled',
  // receipt_attachment_id will be set in tests after uploading
};

export const billedExpense: CreateExpenseInput = {
  date: '2024-01-10',
  vendor: 'Hotel Chain',
  total_amount_cents: 30000, // $300.00
  tax_amount_cents: 2475, // $24.75 (8.25% tax)
  currency: 'USD',
  notes: 'Client meeting accommodation',
  billable: true,
  billing_status: 'billed',
  // linked_invoice_id will be set in tests
};

export const invalidExpenses = {
  negativeAmount: {
    date: '2024-01-15',
    total_amount_cents: -5000, // Negative amount
    tax_amount_cents: 0,
  },
  taxExceedsTotal: {
    date: '2024-01-15',
    total_amount_cents: 10000,
    tax_amount_cents: 15000, // Tax > total
  },
  negativeTax: {
    date: '2024-01-15',
    total_amount_cents: 10000,
    tax_amount_cents: -500, // Negative tax
  },
  vendorTooLong: {
    date: '2024-01-15',
    vendor: 'A'.repeat(201), // Max 200 chars
    total_amount_cents: 10000,
    tax_amount_cents: 0,
  },
  invalidBillingStatus: {
    date: '2024-01-15',
    total_amount_cents: 10000,
    tax_amount_cents: 0,
    billing_status: 'invalid' as any,
  },
  invalidCurrency: {
    date: '2024-01-15',
    total_amount_cents: 10000,
    tax_amount_cents: 0,
    currency: 'EUR', // Only USD supported
  },
};