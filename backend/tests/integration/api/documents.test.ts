/**
 * Document API Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildServer } from '@/server.js';
import { FastifyInstance } from 'fastify';
import { testSupabase, TEST_USER_IDS } from '@tests/setup/test-setup.js';
import { validInvoice, validQuote, documentLineItems } from '@tests/fixtures/documents.js';
import { validClient } from '@tests/fixtures/clients.js';
import { cleanupUserData, createTestClient } from '@tests/helpers/test-helpers.js';

describe('Document API Integration Tests', () => {
  let server: FastifyInstance;
  let authToken: string;
  let clientId: string;

  beforeAll(async () => {
    server = await buildServer();
    await server.ready();

    const { data } = await testSupabase.auth.signInWithPassword({
      email: 'test@test.example.com',
      password: 'testpassword123',
    });

    if (data?.session) {
      authToken = data.session.access_token;
    }

    // Create test client
    const client = await createTestClient(testSupabase, TEST_USER_IDS.user1, validClient);
    clientId = client.id;
  });

  afterAll(async () => {
    await cleanupUserData(testSupabase, TEST_USER_IDS.user1);
    await server.close();
  });

  describe('POST /v1/documents', () => {
    it('should create an invoice with line items', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/documents',
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          ...validInvoice,
          client_id: clientId,
          line_items: documentLineItems,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.document).toHaveProperty('id');
      expect(body.data.document.type).toBe('invoice');
      expect(body.data.line_items).toBeInstanceOf(Array);
      expect(body.data.line_items.length).toBe(2);
    });

    it('should create a quote', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/documents',
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          ...validQuote,
          client_id: clientId,
          line_items: documentLineItems,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.document.type).toBe('quote');
    });

    it('should calculate totals correctly', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/documents',
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          ...validInvoice,
          client_id: clientId,
          line_items: documentLineItems,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.document.subtotal).toBe(8000.00);
      expect(body.data.document.tax).toBe(660.00);
      expect(body.data.document.total).toBe(8660.00);
    });
  });

  describe('GET /v1/documents', () => {
    it('should list all documents', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/documents',
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
    });

    it('should filter by type', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/documents?type=invoice',
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((doc: any) => {
        expect(doc.type).toBe('invoice');
      });
    });

    it('should filter by status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/documents?status=draft',
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((doc: any) => {
        expect(doc.status).toBe('draft');
      });
    });
  });

  describe('POST /v1/documents/:id/finalize', () => {
    let documentId: string;

    beforeEach(async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/documents',
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          ...validInvoice,
          client_id: clientId,
          line_items: documentLineItems,
        },
      });
      const body = JSON.parse(response.body);
      documentId = body.data.document.id;
    });

    it('should finalize a draft document', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/v1/documents/${documentId}/finalize`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.status).toBe('sent');
      expect(body.data.document_number).toBeDefined();
    });
  });

  describe('POST /v1/documents/:id/void', () => {
    let documentId: string;

    beforeEach(async () => {
      // Create and finalize document
      const createResponse = await server.inject({
        method: 'POST',
        url: '/v1/documents',
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          ...validInvoice,
          client_id: clientId,
          line_items: documentLineItems,
        },
      });
      const createBody = JSON.parse(createResponse.body);
      documentId = createBody.data.document.id;

      await server.inject({
        method: 'POST',
        url: `/v1/documents/${documentId}/finalize`,
        headers: { authorization: `Bearer ${authToken}` },
      });
    });

    it('should void a sent document', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/v1/documents/${documentId}/void`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.status).toBe('void');
    });
  });
});