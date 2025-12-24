/**
 * Document Service
 * 
 * Business logic for document (quotes and invoices) management.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Document } from '../../../shared/types/index.js';
import { 
  NotFoundError, 
  BusinessLogicError, 
  dbErrorToApiError 
} from '../../../shared/errors/index.js';
import { 
  CreateDocumentInput, 
  UpdateDocumentInput,
  ListDocumentsQuery,
  LineItemInput 
} from '../../../shared/schemas/document.schema.js';
import { calculateDocumentTotals } from '../../../shared/utils/currency.js';
import { generateDocumentNumber, calculateDueDate, formatDate } from '../../../shared/utils/formatting.js';

export class DocumentService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * List documents for a user
   */
  async list(userId: string, query: ListDocumentsQuery = {}): Promise<Document[]> {
    try {
      let queryBuilder = this.supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId);

      // Filters
      if (!query.include_archived) {
        queryBuilder = queryBuilder.is('archived_at', null);
      }
      if (query.type) {
        queryBuilder = queryBuilder.eq('type', query.type);
      }
      if (query.status) {
        queryBuilder = queryBuilder.eq('status', query.status);
      }
      if (query.client_id) {
        queryBuilder = queryBuilder.eq('client_id', query.client_id);
      }
      if (query.project_id) {
        queryBuilder = queryBuilder.eq('project_id', query.project_id);
      }
      if (query.date_from) {
        queryBuilder = queryBuilder.gte('issue_date', query.date_from);
      }
      if (query.date_to) {
        queryBuilder = queryBuilder.lte('issue_date', query.date_to);
      }
      if (query.search) {
        queryBuilder = queryBuilder.or(`number.ilike.%${query.search}%,po_number.ilike.%${query.search}%`);
      }

      // Sorting
      const sortField = query.sort?.startsWith('-') ? query.sort.substring(1) : query.sort || 'created_at';
      const sortOrder = query.sort?.startsWith('-') ? 'asc' : 'desc';
      queryBuilder = queryBuilder.order(sortField, { ascending: sortOrder === 'asc' });

      // Pagination
      if (query.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Get a single document by ID
   */
  async get(userId: string, id: number): Promise<Document> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Document', id);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Create a new document
   */
  async create(userId: string, input: CreateDocumentInput): Promise<Document> {
    try {
      // Calculate totals if line items provided
      let totals = { subtotal_cents: 0, tax_total_cents: 0, total_cents: 0 };
      if (input.line_items && input.line_items.length > 0) {
        totals = calculateDocumentTotals(input.line_items as any);
      }

      // Create document
      const { data: document, error: docError } = await this.supabase
        .from('documents')
        .insert({
          user_id: userId,
          client_id: input.client_id,
          project_id: input.project_id,
          type: input.type,
          status: 'Draft',
          po_number: input.po_number,
          issue_date: input.issue_date,
          due_date: input.due_date,
          notes: input.notes,
          terms: input.terms,
          subtotal_cents: totals.subtotal_cents,
          tax_total_cents: totals.tax_total_cents,
          total_cents: totals.total_cents,
          balance_due_cents: totals.total_cents,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create line items if provided
      if (input.line_items && input.line_items.length > 0) {
        await this.createLineItems(userId, document.id, input.line_items);
      }

      return document;
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Update a document
   */
  async update(userId: string, id: number, input: UpdateDocumentInput): Promise<Document> {
    try {
      // Get existing document
      const existing = await this.get(userId, id);

      // Check if document can be updated
      if (existing.status !== 'Draft') {
        throw new BusinessLogicError('Only draft documents can be updated');
      }

      // Update line items if provided
      if (input.line_items) {
        // Delete existing line items
        await this.supabase
          .from('document_line_items')
          .delete()
          .eq('document_id', id)
          .eq('user_id', userId);

        // Create new line items
        await this.createLineItems(userId, id, input.line_items);

        // Recalculate totals
        const totals = calculateDocumentTotals(input.line_items as any);
        
        const { data, error } = await this.supabase
          .from('documents')
          .update({
            ...input,
            subtotal_cents: totals.subtotal_cents,
            tax_total_cents: totals.tax_total_cents,
            total_cents: totals.total_cents,
            balance_due_cents: totals.total_cents,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Update without line items
      const { data, error } = await this.supabase
        .from('documents')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (error instanceof BusinessLogicError || error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Finalize a document
   */
  async finalize(userId: string, id: number): Promise<Document> {
    try {
      // Get document
      const document = await this.get(userId, id);

      // Validate document can be finalized
      if (document.status !== 'Draft') {
        throw new BusinessLogicError('Document is already finalized');
      }

      // Check for line items
      const { data: lineItems } = await this.supabase
        .from('document_line_items')
        .select('*')
        .eq('document_id', id)
        .eq('user_id', userId);

      if (!lineItems || lineItems.length === 0) {
        throw new BusinessLogicError('Document must have at least one line item');
      }

      // Get user profile for document numbering
      const { data: profile } = await this.supabase
        .from('user_profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profile) {
        throw new BusinessLogicError('User profile not found');
      }

      // Generate document number
      const prefix = document.type === 'Invoice' ? profile.invoice_prefix : profile.quote_prefix;
      const nextNumber = document.type === 'Invoice' 
        ? profile.next_invoice_number 
        : profile.next_quote_number;
      const documentNumber = generateDocumentNumber(prefix, nextNumber);

      // Set issue date if not provided
      const issueDate = document.issue_date || formatDate(new Date());

      // Calculate due date if not provided
      const paymentTerms = profile.default_payment_terms_days || 30;
      const dueDate = document.due_date || calculateDueDate(issueDate, paymentTerms);

      // Update document
      const { data: finalizedDoc, error } = await this.supabase
        .from('documents')
        .update({
          status: 'Finalized',
          number: documentNumber,
          issue_date: issueDate,
          due_date: dueDate,
          finalized_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update user profile next number
      const nextNumberField = document.type === 'Invoice' 
        ? 'next_invoice_number' 
        : 'next_quote_number';
      
      await this.supabase
        .from('user_profile')
        .update({ [nextNumberField]: nextNumber + 1 })
        .eq('id', userId);

      return finalizedDoc;
    } catch (error) {
      if (error instanceof BusinessLogicError || error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Void an invoice
   */
  async void(userId: string, id: number): Promise<Document> {
    try {
      const document = await this.get(userId, id);

      // Validate can be voided
      if (document.type !== 'Invoice') {
        throw new BusinessLogicError('Only invoices can be voided');
      }
      if (document.balance_due_cents > 0) {
        throw new BusinessLogicError('Cannot void invoice with outstanding balance');
      }
      if (document.status === 'Void') {
        throw new BusinessLogicError('Invoice is already voided');
      }

      const { data, error } = await this.supabase
        .from('documents')
        .update({
          status: 'Void',
          voided_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (error instanceof BusinessLogicError || error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Convert quote to invoice
   */
  async convert(userId: string, id: number): Promise<Document> {
    try {
      const quote = await this.get(userId, id);

      // Validate can be converted
      if (quote.type !== 'Quote') {
        throw new BusinessLogicError('Document is already an invoice');
      }
      if (quote.status !== 'Finalized') {
        throw new BusinessLogicError('Only finalized quotes can be converted');
      }

      // Get line items
      const { data: lineItems } = await this.supabase
        .from('document_line_items')
        .select('*')
        .eq('document_id', id)
        .eq('user_id', userId);

      // Create new invoice
      const { data: invoice, error: invoiceError } = await this.supabase
        .from('documents')
        .insert({
          user_id: userId,
          client_id: quote.client_id,
          project_id: quote.project_id,
          type: 'Invoice',
          status: 'Draft',
          po_number: quote.po_number,
          notes: quote.notes,
          terms: quote.terms,
          subtotal_cents: quote.subtotal_cents,
          tax_total_cents: quote.tax_total_cents,
          total_cents: quote.total_cents,
          balance_due_cents: quote.total_cents,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Copy line items
      if (lineItems && lineItems.length > 0) {
        const newLineItems = lineItems.map(item => ({
          user_id: userId,
          document_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          tax_rate_id: item.tax_rate_id,
          tax_rate_snapshot: item.tax_rate_snapshot,
          line_total_cents: item.line_total_cents,
          sort_order: item.sort_order,
        }));

        await this.supabase
          .from('document_line_items')
          .insert(newLineItems);
      }

      return invoice;
    } catch (error) {
      if (error instanceof BusinessLogicError || error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Delete (archive) a document
   */
  async delete(userId: string, id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('documents')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Calculate document totals from line items
   */
  calculateTotals(lineItems: Array<{ quantity: number; unit_price_cents: number; tax_rate_snapshot: number | null }>) {
    return calculateDocumentTotals(lineItems);
  }

  /**
   * Create line items for a document
   */
  private async createLineItems(userId: string, documentId: number, lineItems: LineItemInput[]): Promise<void> {
    const items = lineItems.map((item, index) => ({
      user_id: userId,
      document_id: documentId,
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      tax_rate_id: item.tax_rate_id,
      tax_rate_snapshot: item.tax_rate_id ? null : 0, // Will be populated by trigger
      line_total_cents: item.quantity * item.unit_price_cents,
      sort_order: item.sort_order ?? index,
    }));

    const { error } = await this.supabase
      .from('document_line_items')
      .insert(items);

    if (error) throw error;
  }
}