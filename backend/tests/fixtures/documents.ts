/**
 * Document Test Fixtures
 * 
 * Predefined test data for document-related tests
 */

export const validInvoice = {
  type: 'invoice',
  status: 'draft',
  issue_date: '2024-01-15',
  due_date: '2024-02-15',
  notes: 'Payment due within 30 days',
  terms: 'Net 30',
};

export const validQuote = {
  type: 'quote',
  status: 'draft',
  issue_date: '2024-01-15',
  valid_until: '2024-02-15',
  notes: 'Quote valid for 30 days',
};

export const validReceipt = {
  type: 'receipt',
  status: 'paid',
  issue_date: '2024-01-15',
  payment_date: '2024-01-15',
};

export const documentLineItems = [
  {
    description: 'Web Development Services',
    quantity: 40,
    unit_price: 150.00,
    tax_rate: 0.0825,
  },
  {
    description: 'Consulting Services',
    quantity: 10,
    unit_price: 200.00,
    tax_rate: 0.0825,
  },
];

export const singleLineItem = [
  {
    description: 'Monthly Retainer',
    quantity: 1,
    unit_price: 5000.00,
    tax_rate: 0.0825,
  },
];

export const invalidDocuments = {
  invalidType: {
    type: 'invalid',
    status: 'draft',
  },
  invalidStatus: {
    type: 'invoice',
    status: 'invalid',
  },
  missingIssueDate: {
    type: 'invoice',
    status: 'draft',
  },
  futureDueDate: {
    type: 'invoice',
    status: 'draft',
    issue_date: '2024-02-15',
    due_date: '2024-01-15', // Due date before issue date
  },
};

export const documentsForFiltering = [
  {
    type: 'invoice',
    status: 'draft',
    issue_date: '2024-01-15',
    total: 1000.00,
  },
  {
    type: 'invoice',
    status: 'sent',
    issue_date: '2024-01-20',
    total: 2000.00,
  },
  {
    type: 'quote',
    status: 'draft',
    issue_date: '2024-01-25',
    total: 1500.00,
  },
  {
    type: 'invoice',
    status: 'paid',
    issue_date: '2024-01-30',
    total: 3000.00,
  },
];