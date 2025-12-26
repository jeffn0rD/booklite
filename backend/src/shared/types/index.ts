/**
 * Shared TypeScript Types
 * 
 * Common type definitions used across the application.
 */

import { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Database entity types
 */
export interface UserProfile {
  id: string;
  email: string;
  business_name: string | null;
  phone: string | null;
  address: Address | null;
  tax_id: string | null;
  logo_attachment_id: number | null;
  default_tax_rate_id: number | null;
  default_payment_terms_days: number;
  invoice_prefix: string;
  quote_prefix: string;
  next_invoice_number: number;
  next_quote_number: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  user_id: string;
  name: string;
  email: string | null;
  billing_address: Address | null;
  tax_vat_id: string | null;
  default_tax_rate_id: number | null;
  default_payment_terms_days: number | null;
  default_currency: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  user_id: string;
  client_id: number;
  name: string;
  status: ProjectStatus;
  default_po_number: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  user_id: string;
  client_id: number;
  project_id: number | null;
  type: DocumentType;
  status: DocumentStatus;
  number: string | null;
  po_number: string | null;
  issue_date: string | null;
  due_date: string | null;
  subtotal_cents: number;
  tax_total_cents: number;
  total_cents: number;
  balance_due_cents: number;
  notes: string | null;
  terms: string | null;
  finalized_at: string | null;
  voided_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentLineItem {
  id: number;
  user_id: string;
  document_id: number;
  description: string;
  quantity: number;
  unit_price_cents: number;
  tax_rate_id: number | null;
  tax_rate_snapshot: number | null;
  line_total_cents: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  user_id: string;
  document_id: number;
  amount_cents: number;
  payment_date: string;
  payment_method: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  user_id: string;
  category_id: number | null;
  project_id: number | null;
  invoice_id: number | null;
  description: string;
  amount_cents: number;
  expense_date: string;
  receipt_attachment_id: number | null;
  billable: boolean;
  billed: boolean;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxRate {
  id: number;
  user_id: string;
  name: string;
  rate: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Nested object types
 */
export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
}

/**
 * Enum types
 */
export type ProjectStatus = 'Active' | 'Completed' | 'OnHold';
export type DocumentType = 'Quote' | 'Invoice';
export type DocumentStatus = 'Draft' | 'Finalized' | 'Sent' | 'Paid' | 'Partial' | 'Overdue' | 'Void';

/**
 * Request/Response types
 */
export interface ListQueryParams {
  limit?: number;
  cursor?: string;
  search?: string;
  sort?: string;
  include_archived?: boolean;
}

export interface PaginationMeta {
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
  total?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    request_id: string;
  };
  pagination?: PaginationMeta;
}

export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

/**
 * Authentication types
 */
export interface AuthUser extends User {
  id: string;
  email: string;
  role?: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Fastify augmentation
 */
declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser;
    supabase: SupabaseClient;
  }

  interface FastifyInstance {
    supabase: SupabaseClient;
  }
}

/**
 * Service method options
 */
export interface ServiceOptions {
  userId: string;
  supabase: SupabaseClient;
}

/**
 * Calculation results
 */
export interface DocumentTotals {
  subtotal_cents: number;
  tax_total_cents: number;
  total_cents: number;
}