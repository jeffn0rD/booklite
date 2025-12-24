/**
 * Test Helper Functions
 * 
 * Utility functions for testing
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { TEST_USER_IDS } from '../setup/test-setup.js';

/**
 * Create a test client in the database
 */
export async function createTestClient(
  supabase: SupabaseClient,
  userId: string,
  clientData: any
) {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      ...clientData,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a test project in the database
 */
export async function createTestProject(
  supabase: SupabaseClient,
  userId: string,
  clientId: string,
  projectData: any
) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...projectData,
      user_id: userId,
      client_id: clientId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a test document in the database
 */
export async function createTestDocument(
  supabase: SupabaseClient,
  userId: string,
  clientId: string,
  documentData: any
) {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      ...documentData,
      user_id: userId,
      client_id: clientId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create test line items for a document
 */
export async function createTestLineItems(
  supabase: SupabaseClient,
  documentId: string,
  lineItems: any[]
) {
  const itemsWithDocId = lineItems.map((item, index) => ({
    ...item,
    document_id: documentId,
    line_number: index + 1,
  }));

  const { data, error } = await supabase
    .from('document_line_items')
    .insert(itemsWithDocId)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Create a test payment in the database
 */
export async function createTestPayment(
  supabase: SupabaseClient,
  userId: string,
  documentId: string,
  paymentData: any
) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      ...paymentData,
      user_id: userId,
      document_id: documentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a test expense in the database
 */
export async function createTestExpense(
  supabase: SupabaseClient,
  userId: string,
  expenseData: any
) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      ...expenseData,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a test category in the database
 */
export async function createTestCategory(
  supabase: SupabaseClient,
  userId: string,
  categoryData: any
) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...categoryData,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete test data for a user
 */
export async function cleanupUserData(
  supabase: SupabaseClient,
  userId: string
) {
  const tables = [
    'document_line_items',
    'documents',
    'payments',
    'expenses',
    'projects',
    'clients',
    'categories',
    'tax_rates',
  ];

  for (const table of tables) {
    await supabase.from(table).delete().eq('user_id', userId);
  }
}

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random email for testing
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@test.example.com`;
}

/**
 * Generate a random UUID for testing
 */
export function generateTestUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}