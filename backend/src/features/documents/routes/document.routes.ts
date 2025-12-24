/**
 * Document Routes
 * 
 * HTTP endpoints for document (quotes and invoices) management.
 */

import { FastifyPluginAsync } from 'fastify';
import { DocumentService } from '../services/document.service.js';
import { authenticate } from '../../../shared/middleware/auth.middleware.js';
import { validateBody, validateQuery, validateParams } from '../../../shared/middleware/validation.middleware.js';
import {
  createDocumentSchema,
  updateDocumentSchema,
  listDocumentsQuerySchema,
  documentIdParamSchema,
  finalizeDocumentSchema,
  CreateDocumentInput,
  UpdateDocumentInput,
  ListDocumentsQuery,
  DocumentIdParam,
  FinalizeDocumentInput,
} from '../../../shared/schemas/document.schema.js';

export const documentRoutes: FastifyPluginAsync = async (fastify) => {
  const documentService = new DocumentService(fastify.supabase);

  /**
   * List documents
   * GET /documents
   */
  fastify.get<{
    Querystring: ListDocumentsQuery;
  }>(
    '/documents',
    {
      preHandler: [authenticate, validateQuery(listDocumentsQuerySchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const documents = await documentService.list(userId, request.query);

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
   * Get document by ID
   * GET /documents/:id
   */
  fastify.get<{
    Params: DocumentIdParam;
  }>(
    '/documents/:id',
    {
      preHandler: [authenticate, validateParams(documentIdParamSchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;
      const document = await documentService.get(userId, id);

      return reply.status(200).send({
        data: document,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );

  /**
   * Create document
   * POST /documents
   */
  fastify.post<{
    Body: CreateDocumentInput;
  }>(
    '/documents',
    {
      preHandler: [authenticate, validateBody(createDocumentSchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const document = await documentService.create(userId, request.body);

      return reply.status(201).send({
        data: document,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );

  /**
   * Update document
   * PUT /documents/:id
   */
  fastify.put<{
    Params: DocumentIdParam;
    Body: UpdateDocumentInput;
  }>(
    '/documents/:id',
    {
      preHandler: [
        authenticate,
        validateParams(documentIdParamSchema),
        validateBody(updateDocumentSchema),
      ],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;
      const document = await documentService.update(userId, id, request.body);

      return reply.status(200).send({
        data: document,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );

  /**
   * Delete (archive) document
   * DELETE /documents/:id
   */
  fastify.delete<{
    Params: DocumentIdParam;
  }>(
    '/documents/:id',
    {
      preHandler: [authenticate, validateParams(documentIdParamSchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;
      await documentService.delete(userId, id);

      return reply.status(204).send();
    }
  );

  /**
   * Finalize document
   * POST /documents/:id/finalize
   */
  fastify.post<{
    Params: DocumentIdParam;
    Body: FinalizeDocumentInput;
  }>(
    '/documents/:id/finalize',
    {
      preHandler: [
        authenticate,
        validateParams(documentIdParamSchema),
        validateBody(finalizeDocumentSchema),
      ],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;
      const document = await documentService.finalize(userId, id);

      return reply.status(200).send({
        data: document,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );

  /**
   * Void invoice
   * POST /documents/:id/void
   */
  fastify.post<{
    Params: DocumentIdParam;
  }>(
    '/documents/:id/void',
    {
      preHandler: [authenticate, validateParams(documentIdParamSchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;
      const document = await documentService.void(userId, id);

      return reply.status(200).send({
        data: document,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );

  /**
   * Convert quote to invoice
   * POST /documents/:id/convert
   */
  fastify.post<{
    Params: DocumentIdParam;
  }>(
    '/documents/:id/convert',
    {
      preHandler: [authenticate, validateParams(documentIdParamSchema)],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;
      const document = await documentService.convert(userId, id);

      return reply.status(201).send({
        data: document,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: request.id,
        },
      });
    }
  );
};