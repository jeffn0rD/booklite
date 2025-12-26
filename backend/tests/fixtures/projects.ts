/**
 * Project Test Fixtures
 * 
 * Predefined test data for project-related tests.
 * All fixtures match the database schema exactly.
 * 
 * Note: Projects table is intentionally minimal. Budget, dates, and hourly rates
 * are NOT part of the schema. Use notes field for additional information.
 */

import type { CreateProjectInput } from '@/shared/schemas/project.schema';

export const validProject: CreateProjectInput = {
  name: 'Website Redesign',
  status: 'Active',
  notes: 'Complete website redesign and development. Budget: $50,000. Timeline: Q1 2024.',
  default_po_number: 'PO-2024-001',
};

export const validProject2: CreateProjectInput = {
  name: 'Mobile App Development',
  status: 'Active',
  notes: 'iOS and Android app development. Budget: $75,000. Start: Feb 2024.',
};

export const completedProject: CreateProjectInput = {
  name: 'Completed Project',
  status: 'Completed',
  notes: 'Successfully completed in 2023. Budget: $30,000.',
};

export const archivedProject: CreateProjectInput = {
  name: 'Archived Project',
  status: 'Archived',
  notes: 'Project archived due to client request.',
};

export const minimalProject: CreateProjectInput = {
  name: 'Minimal Project',
};

export const projectWithQuoteOrigin: CreateProjectInput = {
  name: 'Project from Quote',
  status: 'Active',
  notes: 'Converted from quote #Q-2024-001',
  // origin_quote_id will be set in tests after creating a quote
};

export const invalidProjects = {
  emptyName: {
    name: '',
    status: 'Active',
  },
  nameTooLong: {
    name: 'A'.repeat(201),
  },
  invalidStatus: {
    name: 'Test Project',
    status: 'invalid',
  },
};

export const projectsForSearch: CreateProjectInput[] = [
  {
    name: 'Alpha Project',
    status: 'Active',
    notes: 'First project for testing search',
  },
  {
    name: 'Beta Project',
    status: 'Active',
    notes: 'Second project for testing search',
  },
  {
    name: 'Gamma Project',
    status: 'Completed',
    notes: 'Third project for testing search',
  },
];