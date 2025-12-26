/**
 * Payment Test Fixtures
 * 
 * Predefined test data for payment-related tests.
 * All fixtures match the database schema exactly.
 * 
 * Note: All amounts are in CENTS (multiply dollars by 100).
 * invoice_id must be provided when creating payments.
 */

import type { CreatePaymentInput } from '@/shared/schemas/payment.schema';

export const validPayment: Omit<CreatePaymentInput, 'invoice_id'> = {
  date: '2024-01-15',
  amount_cents: 100000, // $1,000.00
  method: 'bank_transfer',
  reference: 'TXN-12345',
};

export const validPayment2: Omit<CreatePaymentInput, 'invoice_id'> = {
  date: '2024-01-20',
  amount_cents: 250000, // $2,500.00
  method: 'credit_card',
  reference: 'CC-67890',
};

export const partialPayment: Omit<CreatePaymentInput, 'invoice_id'> = {
  date: '2024-01-15',
  amount_cents: 50000, // $500.00
  method: 'check',
  reference: 'CHK-001',
};

export const cashPayment: Omit<CreatePaymentInput, 'invoice_id'> = {
  date: '2024-01-15',
  amount_cents: 75000, // $750.00
  method: 'cash',
  reference: 'CASH-001',
};

export const wireTransferPayment: Omit<CreatePaymentInput, 'invoice_id'> = {
  date: '2024-01-20',
  amount_cents: 500000, // $5,000.00
  method: 'wire_transfer',
  reference: 'WIRE-2024-001',
};

export const invalidPayments = {
  negativeAmount: {
    date: '2024-01-15',
    amount_cents: -10000, // Negative amount
    method: 'cash',
  },
  zeroAmount: {
    date: '2024-01-15',
    amount_cents: 0, // Must be positive
    method: 'cash',
  },
  missingDate: {
    amount_cents: 100000,
    method: 'cash',
  },
  methodTooLong: {
    date: '2024-01-15',
    amount_cents: 100000,
    method: 'A'.repeat(51), // Max 50 chars
  },
  referenceTooLong: {
    date: '2024-01-15',
    amount_cents: 100000,
    method: 'cash',
    reference: 'A'.repeat(101), // Max 100 chars
  },
};