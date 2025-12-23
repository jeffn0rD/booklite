/**
 * Client Routes
 * 
 * Handles all client-related API endpoints including CRUD operations,
 * listing with filters, and related resources.
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ClientService } from '../services/client';
import {
  createClientSchema,
  updateClientSchema,
  listClientsQuerySchema,
  clientResponseSchema,
  listClientsResponseSchema
} from '../schemas/client';

export const clientRoutes: FastifyPluginAsync = async (fastify) => {
  const clientService = new ClientService(fastify.supabase);

  /**
   * List Clients
   * GET /clients
   * 
   * Query Parameters:
   * - limit: Number of items (default: 20, max: 100)
   * - cursor: Pagination cursor
   * - search: Search by name or email
   * - archived: Filter by archived status
   * - sort: Sort field (default: -created_at)
   */
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: listClientsQuerySchema,
      response: {
        200: listClientsResponseSchema
      },
      tags: ['Clients'],
      summary: 'List all clients',
      description: 'Retrieve a paginated list of clients for the authenticated user'
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const query = request.query as z.infer<typeof listClientsQuerySchema>;
    
    const result = await clientService.list(userId, query);
    
    return {
      data: result.data,
      pagination: result.pagination,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    };
  });

  /**
   * Get Client
   * GET /clients/:id
   * 
   * Path Parameters:
   * - id: Client ID
   * 
   * Query Parameters:
   * - expand: Include related resources (e.g., projects,documents)
   */
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: z.coerce.number().int().positive()
      }),
      querystring: z.object({
        expand: z.string().optional()
      }),
      response: {
        200: clientResponseSchema
      },
      tags: ['Clients'],
      summary: 'Get a client',
      description: 'Retrieve a specific client by ID'
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const { id } = request.params as { id: number };
    const { expand } = request.query as { expand?: string };
    
    const client = await clientService.get(userId, id, expand);
    
    if (!client) {
      return reply.code(404).send({
        type: 'https://api.booklite.app/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Client with ID ${id} not found`,
        instance: request.url,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id
        }
      });
    }
    
    return {
      data: client,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    };
  });

  /**
   * Create Client
   * POST /clients
   * 
   * Request Body: CreateClientInput
   */
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: {
      body: createClientSchema,
      response: {
        201: clientResponseSchema
      },
      tags: ['Clients'],
      summary: 'Create a client',
      description: 'Create a new client for the authenticated user'
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const input = request.body as z.infer<typeof createClientSchema>;
    
    try {
      const client = await clientService.create(userId, input);
      
      reply.code(201);
      return {
        data: client,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id
        }
      };
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        return reply.code(409).send({
          type: 'https://api.booklite.app/errors/conflict',
          title: 'Conflict',
          status: 409,
          detail: `Client with name '${input.name}' already exists`,
          instance: request.url,
          meta: {
            timestamp: new Date().toISOString(),
            request_id: request.id
          }
        });
      }
      throw error;
    }
  });

  /**
   * Update Client
   * PUT /clients/:id
   * 
   * Path Parameters:
   * - id: Client ID
   * 
   * Request Body: UpdateClientInput
   */
  fastify.put('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: z.coerce.number().int().positive()
      }),
      body: updateClientSchema,
      response: {
        200: clientResponseSchema
      },
      tags: ['Clients'],
      summary: 'Update a client',
      description: 'Update an existing client (full update)'
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const { id } = request.params as { id: number };
    const input = request.body as z.infer<typeof updateClientSchema>;
    
    const client = await clientService.update(userId, id, input);
    
    if (!client) {
      return reply.code(404).send({
        type: 'https://api.booklite.app/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Client with ID ${id} not found`,
        instance: request.url,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id
        }
      });
    }
    
    return {
      data: client,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    };
  });

  /**
   * Partial Update Client
   * PATCH /clients/:id
   * 
   * Path Parameters:
   * - id: Client ID
   * 
   * Request Body: Partial<UpdateClientInput>
   */
  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: z.coerce.number().int().positive()
      }),
      body: updateClientSchema.partial(),
      response: {
        200: clientResponseSchema
      },
      tags: ['Clients'],
      summary: 'Partially update a client',
      description: 'Update specific fields of an existing client'
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const { id } = request.params as { id: number };
    const input = request.body as Partial<z.infer<typeof updateClientSchema>>;
    
    const client = await clientService.update(userId, id, input);
    
    if (!client) {
      return reply.code(404).send({
        type: 'https://api.booklite.app/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Client with ID ${id} not found`,
        instance: request.url,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id
        }
      });
    }
    
    return {
      data: client,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    };
  });

  /**
   * Delete Client (Archive)
   * DELETE /clients/:id
   * 
   * Path Parameters:
   * - id: Client ID
   * 
   * Soft deletes the client by setting archived_at timestamp
   */
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: z.coerce.number().int().positive()
      }),
      response: {
        204: z.void()
      },
      tags: ['Clients'],
      summary: 'Delete a client',
      description: 'Archive a client (soft delete)'
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const { id } = request.params as { id: number };
    
    try {
      await clientService.delete(userId, id);
      reply.code(204).send();
    } catch (error: any) {
      if (error.code === '23503') { // Foreign key constraint violation
        return reply.code(422).send({
          type: 'https://api.booklite.app/errors/business-rule-violation',
          title: 'Business Rule Violation',
          status: 422,
          detail: 'Cannot delete client with active projects or documents',
          instance: request.url,
          meta: {
            timestamp: new Date().toISOString(),
            request_id: request.id
          }
        });
      }
      throw error;
    }
  });

  /**
   * Get Client Projects
   * GET /clients/:id/projects
   * 
   * Path Parameters:
   * - id: Client ID
   * 
   * Query Parameters:
   * - status: Filter by project status
   */
  fastify.get('/:id/projects', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: z.coerce.number().int().positive()
      }),
      querystring: z.object({
        status: z.enum(['Active', 'Completed', 'Archived']).optional()
      }),
      tags: ['Clients'],
      summary: 'Get client projects',
      description: 'Retrieve all projects for a specific client'
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const { id } = request.params as { id: number };
    const { status } = request.query as { status?: string };
    
    const projects = await clientService.getProjects(userId, id, status);
    
    return {
      data: projects,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    };
  });

  /**
   * Get Client Documents
   * GET /clients/:id/documents
   * 
   * Path Parameters:
   * - id: Client ID
   * 
   * Query Parameters:
   * - type: Filter by document type (quote/invoice)
   * - status: Filter by document status
   */
  fastify.get('/:id/documents', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: z.coerce.number().int().positive()
      }),
      querystring: z.object({
        type: z.enum(['quote', 'invoice']).optional(),
        status: z.string().optional()
      }),
      tags: ['Clients'],
      summary: 'Get client documents',
      description: 'Retrieve all documents (quotes/invoices) for a specific client'
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const { id } = request.params as { id: number };
    const query = request.query as { type?: string; status?: string };
    
    const documents = await clientService.getDocuments(userId, id, query);
    
    return {
      data: documents,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    };
  });

  /**
   * Get Client Notes
   * GET /clients/:id/notes
   * 
   * Path Parameters:
   * - id: Client ID
   */
  fastify.get('/:id/notes', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: z.coerce.number().int().positive()
      }),
      tags: ['Clients'],
      summary: 'Get client notes',
      description: 'Retrieve all internal notes for a specific client'
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const { id } = request.params as { id: number };
    
    const notes = await clientService.getNotes(userId, id);
    
    return {
      data: notes,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    };
  });

  /**
   * Add Client Note
   * POST /clients/:id/notes
   * 
   * Path Parameters:
   * - id: Client ID
   * 
   * Request Body:
   * - body: Note content
   */
  fastify.post('/:id/notes', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: z.coerce.number().int().positive()
      }),
      body: z.object({
        body: z.string().min(1)
      }),
      tags: ['Clients'],
      summary: 'Add client note',
      description: 'Add an internal note to a specific client'
    }
  }, async (request, reply) => {
    const userId = request.user.sub;
    const { id } = request.params as { id: number };
    const { body } = request.body as { body: string };
    
    const note = await clientService.addNote(userId, id, body);
    
    reply.code(201);
    return {
      data: note,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    };
  });
};