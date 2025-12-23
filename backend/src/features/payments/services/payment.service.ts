/**
 * Payment Service
 * 
 * Business logic for payment management operations.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Payment } from '../../../shared/types/index.js';
import { NotFoundError, BusinessLogicError, dbErrorToApiError } from '../../../shared/errors/index.js';
import { CreatePaymentInput, UpdatePaymentInput, ListPaymentsQuery } from '../../../shared/schemas/payment.schema.js';

export class PaymentService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * List payments for a user
   */
  async list(userId: string, query: ListPaymentsQuery = {}): Promise<Payment[]> {
    try {
      let queryBuilder = this.supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId);

      // Filter by document
      if (query.document_id) {
        queryBuilder = queryBuilder.eq('document_id', query.document_id);
      }

      // Date range filters
      if (query.date_from) {
        queryBuilder = queryBuilder.gte('payment_date', query.date_from);
      }
      if (query.date_to) {
        queryBuilder = queryBuilder.lte('payment_date', query.date_to);
      }

      // Sorting
      const sortField = query.sort?.startsWith('-') ? query.sort.substring(1) : query.sort || 'payment_date';
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
   * Get a single payment by ID
   */
  async get(userId: string, id: number): Promise<Payment> {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Payment', id);
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Create a new payment
   */
  async create(userId: string, input: CreatePaymentInput): Promise<Payment> {
    try {
      // Get the document to validate
      const { data: document, error: docError } = await this.supabase
        .from('documents')
        .select('*')
        .eq('id', input.document_id)
        .eq('user_id', userId)
        .single();

      if (docError) throw docError;
      if (!document) throw new NotFoundError('Document', input.document_id);

      // Validate document is finalized
      if (document.status === 'Draft') {
        throw new BusinessLogicError('Cannot create payment for draft document');
      }

      // Validate payment doesn't exceed balance due
      if (input.amount_cents > document.balance_due_cents) {
        throw new BusinessLogicError('Payment amount exceeds balance due');
      }

      // Create payment
      const { data: payment, error: paymentError } = await this.supabase
        .from('payments')
        .insert({
          ...input,
          user_id: userId,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update document balance and status
      const newBalance = document.balance_due_cents - input.amount_cents;
      let newStatus = document.status;
      
      if (newBalance === 0) {
        newStatus = 'Paid';
      } else if (newBalance < document.total_cents) {
        newStatus = 'Partial';
      }

      await this.supabase
        .from('documents')
        .update({
          balance_due_cents: newBalance,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.document_id)
        .eq('user_id', userId);

      return payment;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BusinessLogicError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Update a payment
   */
  async update(userId: string, id: number, input: UpdatePaymentInput): Promise<Payment> {
    try {
      // Get existing payment
      const existingPayment = await this.get(userId, id);

      // Get document
      const { data: document } = await this.supabase
        .from('documents')
        .select('*')
        .eq('id', existingPayment.document_id)
        .eq('user_id', userId)
        .single();

      if (!document) throw new NotFoundError('Document', existingPayment.document_id);

      // If amount is changing, validate and update document balance
      if (input.amount_cents && input.amount_cents !== existingPayment.amount_cents) {
        const amountDiff = input.amount_cents - existingPayment.amount_cents;
        const newBalance = document.balance_due_cents - amountDiff;

        if (newBalance < 0) {
          throw new BusinessLogicError('Payment amount exceeds balance due');
        }

        // Update document balance
        let newStatus = document.status;
        if (newBalance === 0) {
          newStatus = 'Paid';
        } else if (newBalance < document.total_cents) {
          newStatus = 'Partial';
        } else {
          newStatus = 'Finalized';
        }

        await this.supabase
          .from('documents')
          .update({
            balance_due_cents: newBalance,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPayment.document_id)
          .eq('user_id', userId);
      }

      // Update payment
      const { data, error } = await this.supabase
        .from('payments')
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
      if (error instanceof NotFoundError || error instanceof BusinessLogicError) throw error;
      throw dbErrorToApiError(error);
    }
  }

  /**
   * Delete a payment
   */
  async delete(userId: string, id: number): Promise<void> {
    try {
      // Get payment
      const payment = await this.get(userId, id);

      // Get document
      const { data: document } = await this.supabase
        .from('documents')
        .select('*')
        .eq('id', payment.document_id)
        .eq('user_id', userId)
        .single();

      if (!document) throw new NotFoundError('Document', payment.document_id);

      // Delete payment
      const { error: deleteError } = await this.supabase
        .from('payments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Update document balance
      const newBalance = document.balance_due_cents + payment.amount_cents;
      let newStatus = document.status;
      
      if (newBalance === document.total_cents) {
        newStatus = 'Finalized';
      } else if (newBalance < document.total_cents) {
        newStatus = 'Partial';
      }

      await this.supabase
        .from('documents')
        .update({
          balance_due_cents: newBalance,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.document_id)
        .eq('user_id', userId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw dbErrorToApiError(error);
    }
  }
}