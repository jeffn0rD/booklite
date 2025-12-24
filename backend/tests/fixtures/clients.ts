/**
 * Client Test Fixtures
 * 
 * Predefined test data for client-related tests
 */

export const validClient = {
  name: 'Acme Corporation',
  email: 'contact@acme.test.example.com',
  phone: '+1-555-0100',
  company: 'Acme Corp',
  address: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  postal_code: '94102',
  country: 'US',
  tax_id: '12-3456789',
  notes: 'Premium client',
  is_active: true,
};

export const validClient2 = {
  name: 'TechStart Inc',
  email: 'hello@techstart.test.example.com',
  phone: '+1-555-0200',
  company: 'TechStart Inc',
  address: '456 Tech Ave',
  city: 'Austin',
  state: 'TX',
  postal_code: '78701',
  country: 'US',
  is_active: true,
};

export const minimalClient = {
  name: 'Minimal Client',
};

export const invalidClients = {
  emptyName: {
    name: '',
    email: 'test@test.example.com',
  },
  invalidEmail: {
    name: 'Test Client',
    email: 'invalid-email',
  },
  nameTooLong: {
    name: 'A'.repeat(256),
  },
};

export const clientsForSearch = [
  {
    name: 'Alpha Solutions',
    email: 'alpha@test.example.com',
    company: 'Alpha Corp',
  },
  {
    name: 'Beta Technologies',
    email: 'beta@test.example.com',
    company: 'Beta Inc',
  },
  {
    name: 'Gamma Innovations',
    email: 'gamma@test.example.com',
    company: 'Gamma LLC',
  },
];

export const archivedClient = {
  name: 'Archived Client',
  email: 'archived@test.example.com',
  is_active: false,
};