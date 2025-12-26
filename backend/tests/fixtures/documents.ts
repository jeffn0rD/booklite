/**
 * Document Test Fixtures
 * 
 * Predefined test data for document-related tests.
 * All fixtures match the database schema exactly.
 * 
 * Note: All amounts are in CENTS (multiply dollars by 100).
 * client_id is required and must be provided when creating documents.
 */

import type { CreateDocumentInput } from '@/shared/schemas/document.schema';

export const validInvoice: Omit<CreateDocumentInput, 'client_id'> = {
  type: 'invoice',
  issue_date: '2024-01-15',
  due_date: '2024-02-15',
  public_notes: 'Payment due within 30 days',
  internal_notes: 'Client has good payment history',
  currency: 'USD',
  status: 'Draft',
};

export const validQuote: Omit<CreateDocumentInput, 'client_id'> = {
  type: 'quote',
  issue_date: '2024-01-15',
  expiry_date: '2024-02-15',
  public_notes: 'Quote valid for 30 days',
  internal_notes: 'Follow up in 2 weeks',
  currency: 'USD',
  status: 'Draft',
};

export const invoiceWithProject: Omit<CreateDocumentInput, 'client_id'> = {
  type: 'invoice',
  issue_date: '2024-01-15',
  due_date: '2024-02-15',
  po_number: 'PO-2024-001',
  public_notes: 'Thank you for your business',
  currency: 'USD',
  status: 'Draft',
  // project_id will be set in tests
};

export const sentInvoice: Omit<CreateDocumentInput, 'client_id'> = {
  type: 'invoice',
  issue_date: '2024-01-10',
  due_date: '2024-02-10',
  public_notes: 'Payment due within 30 days',
  currency: 'USD',
  status: 'Sent',
  // sent_at will be set automatically
};

export const documentLineItems = [
  {
    description: 'Web Development Services',
    quantity: 40,
    unit_price_cents: 15000, // $150.00
    discount_percent: 0,
    // tax_rate_id will be set in tests
  },
  {
    description: 'Consulting Services',
    quantity: 10,
    unit_price_cents: 20000, // $200.00
    discount_percent: 0,
    // tax_rate_id will be set in tests
  },
];

export const singleLineItem = [
  {
    description: 'Monthly Retainer',
    quantity: 1,
    unit_price_cents: 500000, // $5,000.00
    discount_percent: 0,
    // tax_rate_id will be set in tests
  },
];

export const lineItemWithDiscount = [
  {
    description: 'Premium Service Package',
    quantity: 1,
    unit_price_cents: 1000000, // $10,000.00
    discount_percent: 10, // 10% discount
    // tax_rate_id will be set in tests
  },
];

export const multipleLineItems = [
  {
    description: 'Design Services',
    quantity: 20,
    unit_price_cents: 12500, // $125.00
    discount_percent: 0,
  },
  {
    description: 'Development Services',
    quantity: 40,
    unit_price_cents: 15000, // $150.00
    discount_percent: 5,
  },
  {
    description: 'Project Management',
    quantity: 10,
    unit_price_cents: 17500, // $175.00
    discount_percent: 0,
  },
];

export const invalidDocuments = {
  invalidType: {
    type: 'invalid' as any,
    status: 'Draft',
  },
  invalidStatus: {
    type: 'invoice',
    status: 'invalid',
  },
  dueDateBeforeIssueDate: {
    type: 'invoice',
    issue_date: '2024-02-15',
    due_date: '2024-01-15', // Due date before issue date
  },
  expiryDateBeforeIssueDate: {
    type: 'quote',
    issue_date: '2024-02-15',
    expiry_date: '2024-01-15', // Expiry before issue date
  },
  invalidCurrency: {
    type: 'invoice',
    currency: 'EUR', // Only USD supported
  },
  poNumberTooLong: {
    type: 'invoice',
    po_number: 'A'.repeat(51), // Max 50 chars
  },
};

export const documentsForFiltering: Array<Omit<CreateDocumentInput, 'client_id'>> = [
  {
    type: 'invoice',
    status: 'Draft',
    issue_date: '2024-01-15',
    currency: 'USD',
  },
  {
    type: 'invoice',
    status: 'Sent',
    issue_date: '2024-01-20',
    currency: 'USD',
  },
  {
    type: 'quote',
    status: 'Draft',
    issue_date: '2024-01-25',
    currency: 'USD',
  },
  {
    type: 'invoice',
    status: 'Paid',
    issue_date: '2024-01-30',
    currency: 'USD',
  },
];