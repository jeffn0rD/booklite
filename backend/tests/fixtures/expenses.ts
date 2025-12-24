/**
 * Expense Test Fixtures
 */

export const validExpense = {
  description: 'Office Supplies',
  amount: 150.00,
  expense_date: '2024-01-15',
  vendor: 'Office Depot',
  payment_method: 'credit_card',
  is_billable: false,
  notes: 'Monthly office supplies',
};

export const billableExpense = {
  description: 'Travel Expenses',
  amount: 500.00,
  expense_date: '2024-01-20',
  vendor: 'United Airlines',
  payment_method: 'credit_card',
  is_billable: true,
  notes: 'Client meeting travel',
};

export const recurringExpense = {
  description: 'Software Subscription',
  amount: 99.00,
  expense_date: '2024-01-01',
  vendor: 'Adobe',
  payment_method: 'credit_card',
  is_billable: false,
};

export const invalidExpenses = {
  negativeAmount: {
    description: 'Test Expense',
    amount: -50.00,
    expense_date: '2024-01-15',
  },
  emptyDescription: {
    description: '',
    amount: 100.00,
    expense_date: '2024-01-15',
  },
  futureDate: {
    description: 'Test Expense',
    amount: 100.00,
    expense_date: '2025-12-31',
  },
};