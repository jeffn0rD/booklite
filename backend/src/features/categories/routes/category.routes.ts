/**
 * Category Routes
 * 
 * HTTP endpoints for category management.
 */

import { FastifyPluginAsync } from 'fastify';
import { CategoryService } from '../services/category.service.js';
import { authenticate } from '../../../shared/middleware/auth.middleware.js';
import { validateBody, validateQuery, validateParams } from '../../../shared/middleware/validation.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
  categoryIdParamSchema,
  CreateCategoryInput,
  UpdateCategoryInput,
  ListCategoriesQuery,
  CategoryIdParam,
} from '../../../shared/schemas/category.schema.js';

export const categoryRoutes: FastifyPluginAsync = async (fastify) => {
  const categoryService = new CategoryService(fastify.supabase);

  fastify.get<{ Querystring: ListCategoriesQuery }>(
    '/categories',
    { preHandler: [authenticate, validateQuery(listCategoriesQuerySchema)] },
    async (request, reply) => {
      const categories = await categoryService.list(request.user.id, request.query);
      return reply.status(200).send({
        data: categories,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.get<{ Params: CategoryIdParam }>(
    '/categories/:id',
    { preHandler: [authenticate, validateParams(categoryIdParamSchema)] },
    async (request, reply) => {
      const category = await categoryService.get(request.user.id, request.params.id);
      return reply.status(200).send({
        data: category,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.post<{ Body: CreateCategoryInput }>(
    '/categories',
    { preHandler: [authenticate, validateBody(createCategorySchema)] },
    async (request, reply) => {
      const category = await categoryService.create(request.user.id, request.body);
      return reply.status(201).send({
        data: category,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.put<{ Params: CategoryIdParam; Body: UpdateCategoryInput }>(
    '/categories/:id',
    {
      preHandler: [
        authenticate,
        validateParams(categoryIdParamSchema),
        validateBody(updateCategorySchema),
      ],
    },
    async (request, reply) => {
      const category = await categoryService.update(request.user.id, request.params.id, request.body);
      return reply.status(200).send({
        data: category,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.delete<{ Params: CategoryIdParam }>(
    '/categories/:id',
    { preHandler: [authenticate, validateParams(categoryIdParamSchema)] },
    async (request, reply) => {
      await categoryService.delete(request.user.id, request.params.id);
      return reply.status(204).send();
    }
  );
};