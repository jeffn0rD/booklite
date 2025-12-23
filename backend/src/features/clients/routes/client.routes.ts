/**
 * Client Routes
 * 
 * HTTP endpoints for client management.
 */

import { FastifyPluginAsync } from 'fastify';
import { ClientService } from '../services/client.service.js';
import { authenticate } from '../../../shared/middleware/auth.middleware.js';
import { validateBody, validateQuery, validateParams } from '../../../shared/middleware/validation.middleware.js';
import {
  createClientSchema,
  updateClientSchema,
  listClientsQuerySchema,
  clientIdParamSchema,
  CreateClientInput,
  UpdateClientInput,
  ListClientsQuery,
  ClientIdParam,
} from '../../../shared/schemas/client.schema.js';

export const clientRoutes: FastifyPluginAsync = async (fastify) => {
  const clientService = new ClientService(fastify.supabase);

  /**
   * List clients
   * GET /clients
   */
  fastify.get<{
    Querystring: ListClientsQuery;
  }>(
    '/clients',
    {
      preHandler: [authenticate, validateQuery(listClientsQuerySchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const clients = await clientService.list(userId, request.query);

      return reply.status(200).send({
        data: clients,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );

  /**
   * Get client by ID
   * GET /clients/:id
   */
  fastify.get<{
    Params: ClientIdParam;
  }>(
    '/clients/:id',
    {
      preHandler: [authenticate, validateParams(clientIdParamSchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;
      const client = await clientService.get(userId, id);

      return reply.status(200).send({
        data: client,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );

  /**
   * Create client
   * POST /clients
   */
  fastify.post<{
    Body: CreateClientInput;
  }>(
    '/clients',
    {
      preHandler: [authenticate, validateBody(createClientSchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const client = await clientService.create(userId, request.body);

      return reply.status(201).send({
        data: client,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );

  /**
   * Update client
   * PUT /clients/:id
   */
  fastify.put<{
    Params: ClientIdParam;
    Body: UpdateClientInput;
  }>(
    '/clients/:id',
    {
      preHandler: [
        authenticate,
        validateParams(clientIdParamSchema),
        validateBody(updateClientSchema),
      ],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;
      const client = await clientService.update(userId, id, request.body);

      return reply.status(200).send({
        data: client,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );

  /**
   * Delete (archive) client
   * DELETE /clients/:id
   */
  fastify.delete<{
    Params: ClientIdParam;
  }>(
    '/clients/:id',
    {
      preHandler: [authenticate, validateParams(clientIdParamSchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;
      await clientService.delete(userId, id);

      return reply.status(204).send();
    }
  );

  /**
   * Get client documents
   * GET /clients/:id/documents
   */
  fastify.get<{
    Params: ClientIdParam;
  }>(
    '/clients/:id/documents',
    {
      preHandler: [authenticate, validateParams(clientIdParamSchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;
      const documents = await clientService.getDocuments(userId, id);

      return reply.status(200).send({
        data: documents,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );

  /**
   * Get client projects
   * GET /clients/:id/projects
   */
  fastify.get<{
    Params: ClientIdParam;
  }>(
    '/clients/:id/projects',
    {
      preHandler: [authenticate, validateParams(clientIdParamSchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;
      const projects = await clientService.getProjects(userId, id);

      return reply.status(200).send({
        data: projects,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );
};