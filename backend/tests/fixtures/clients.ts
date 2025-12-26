/**
 * Client Test Fixtures
 * 
 * Predefined test data for client-related tests.
 * All fixtures match the database schema exactly.
 */

import type { CreateClientInput } from '@/shared/schemas/client.schema';

export const validClient: CreateClientInput = {
  name: 'Acme Corporation',
  email: 'contact@acme.test.example.com',
  billing_address: {
    line1: '123 Main St',
    city: 'San Francisco',
    region: 'CA',
    postal_code: '94102',
    country: 'US',
  },
  tax_vat_id: '12-3456789',
  default_payment_terms_days: 30,
};

export const validClient2: CreateClientInput = {
  name: 'TechStart Inc',
  email: 'hello@techstart.test.example.com',
  billing_address: {
    line1: '456 Tech Ave',
    city: 'Austin',
    region: 'TX',
    postal_code: '78701',
    country: 'US',
  },
  default_payment_terms_days: 45,
};

export const minimalClient: CreateClientInput = {
  name: 'Minimal Client',
};

export const clientWithInternationalAddress: CreateClientInput = {
  name: 'Global Tech Solutions',
  email: 'billing@globaltech.com',
  billing_address: {
    line1: '200 Tech Avenue',
    city: 'Birmingham',
    region: 'West Midlands',
    postal_code: 'B1 1AA',
    country: 'GB',
  },
  tax_vat_id: 'GB111222333',
  default_payment_terms_days: 45,
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
    name: 'A'.repeat(201),
  },
  invalidCountryCode: {
    name: 'Test Client',
    billing_address: {
      country: 'USA', // Should be 2-letter code
    },
  },
};

export const clientsForSearch: CreateClientInput[] = [
  {
    name: 'Alpha Solutions',
    email: 'alpha@test.example.com',
    billing_address: {
      line1: '100 Alpha Street',
      city: 'New York',
      region: 'NY',
      postal_code: '10001',
      country: 'US',
    },
  },
  {
    name: 'Beta Technologies',
    email: 'beta@test.example.com',
    billing_address: {
      line1: '200 Beta Avenue',
      city: 'Los Angeles',
      region: 'CA',
      postal_code: '90001',
      country: 'US',
    },
  },
  {
    name: 'Gamma Innovations',
    email: 'gamma@test.example.com',
    billing_address: {
      line1: '300 Gamma Boulevard',
      city: 'Chicago',
      region: 'IL',
      postal_code: '60601',
      country: 'US',
    },
  },
];

// For testing archived clients - set archived_at after creation
export const archivedClientData: CreateClientInput = {
  name: 'Archived Client',
  email: 'archived@test.example.com',
};