/**
 * Payment Test Fixtures
 */

export const validPayment = {
  amount: 1000.00,
  payment_date: '2024-01-15',
  payment_method: 'bank_transfer',
  reference: 'TXN-12345',
  notes: 'Payment received via bank transfer',
};

export const validPayment2 = {
  amount: 2500.00,
  payment_date: '2024-01-20',
  payment_method: 'credit_card',
  reference: 'CC-67890',
};

export const partialPayment = {
  amount: 500.00,
  payment_date: '2024-01-15',
  payment_method: 'check',
  reference: 'CHK-001',
  notes: 'Partial payment',
};

export const invalidPayments = {
  negativeAmount: {
    amount: -100.00,
    payment_date: '2024-01-15',
    payment_method: 'cash',
  },
  invalidMethod: {
    amount: 1000.00,
    payment_date: '2024-01-15',
    payment_method: 'invalid',
  },
  futureDate: {
    amount: 1000.00,
    payment_date: '2025-12-31',
    payment_method: 'cash',
  },
};