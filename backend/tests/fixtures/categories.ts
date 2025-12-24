/**
 * Category Test Fixtures
 */

export const validCategory = {
  name: 'Consulting',
  type: 'income',
  description: 'Consulting services revenue',
  is_active: true,
};

export const expenseCategory = {
  name: 'Office Expenses',
  type: 'expense',
  description: 'General office expenses',
  is_active: true,
};

export const inactiveCategory = {
  name: 'Deprecated Category',
  type: 'income',
  is_active: false,
};

export const invalidCategories = {
  emptyName: {
    name: '',
    type: 'income',
  },
  invalidType: {
    name: 'Test Category',
    type: 'invalid',
  },
};