/**
 * Client API Integration Tests
 * 
 * End-to-end tests for client endpoints
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildServer } from '@/server.js';
import { FastifyInstance } from 'fastify';
import { testSupabase, TEST_USER_IDS } from '@tests/setup/test-setup.js';
import { validClient, validClient2, minimalClient } from '@tests/fixtures/clients.js';
import { cleanupUserData } from '@tests/helpers/test-helpers.js';

describe('Client API Integration Tests', () => {
  let server: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    server = await buildServer();
    await server.ready();

    // Create test user and get auth token
    const { data, error } = await testSupabase.auth.signInWithPassword({
      email: 'test@test.example.com',
      password: 'testpassword123',
    });

    if (data?.session) {
      authToken = data.session.access_token;
    }
  });

  afterAll(async () => {
    await cleanupUserData(testSupabase, TEST_USER_IDS.user1);
    await server.close();
  });

  beforeEach(async () => {
    await cleanupUserData(testSupabase, TEST_USER_IDS.user1);
  });

  describe('POST /v1/clients', () => {
    it('should create a new client', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: validClient,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveProperty('id');
      expect(body.data.name).toBe(validClient.name);
      expect(body.data.email).toBe(validClient.email);
    });

    it('should create a client with minimal data', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: minimalClient,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe(minimalClient.name);
    });

    it('should return 400 for invalid data', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: { name: '' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/clients',
        payload: validClient,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /v1/clients', () => {
    beforeEach(async () => {
      // Create test clients
      await server.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: validClient,
      });
      await server.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: validClient2,
      });
    });

    it('should list all clients', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/clients',
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBeGreaterThanOrEqual(2);
      expect(body.meta).toHaveProperty('total');
      expect(body.meta).toHaveProperty('page');
      expect(body.meta).toHaveProperty('limit');
    });

    it('should filter clients by search query', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/clients?search=Acme',
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0].name).toContain('Acme');
    });

    it('should support pagination', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/clients?page=1&limit=1',
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBe(1);
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(1);
    });

    it('should support sorting', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/clients?sort_by=name&sort_order=desc',
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /v1/clients/:id', () => {
    let clientId: string;

    beforeEach(async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: validClient,
      });
      const body = JSON.parse(response.body);
      clientId = body.data.id;
    });

    it('should get a client by id', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/v1/clients/${clientId}`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.id).toBe(clientId);
      expect(body.data.name).toBe(validClient.name);
    });

    it('should return 404 for non-existent client', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/clients/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /v1/clients/:id', () => {
    let clientId: string;

    beforeEach(async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: validClient,
      });
      const body = JSON.parse(response.body);
      clientId = body.data.id;
    });

    it('should update a client', async () => {
      const updates = { name: 'Updated Name', email: 'updated@test.example.com' };
      const response = await server.inject({
        method: 'PUT',
        url: `/v1/clients/${clientId}`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: updates,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe(updates.name);
      expect(body.data.email).toBe(updates.email);
    });

    it('should return 404 for non-existent client', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/v1/clients/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${authToken}` },
        payload: { name: 'Test' },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: `/v1/clients/${clientId}`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: { email: 'invalid-email' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /v1/clients/:id', () => {
    let clientId: string;

    beforeEach(async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: validClient,
      });
      const body = JSON.parse(response.body);
      clientId = body.data.id;
    });

    it('should delete a client', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: `/v1/clients/${clientId}`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(204);

      // Verify client is deleted
      const getResponse = await server.inject({
        method: 'GET',
        url: `/v1/clients/${clientId}`,
        headers: { authorization: `Bearer ${authToken}` },
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 for non-existent client', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/v1/clients/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /v1/clients/:id/documents', () => {
    let clientId: string;

    beforeEach(async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: validClient,
      });
      const body = JSON.parse(response.body);
      clientId = body.data.id;
    });

    it('should get all documents for a client', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/v1/clients/${clientId}/documents`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /v1/clients/:id/projects', () => {
    let clientId: string;

    beforeEach(async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/clients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: validClient,
      });
      const body = JSON.parse(response.body);
      clientId = body.data.id;
    });

    it('should get all projects for a client', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/v1/clients/${clientId}/projects`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
    });
  });
});