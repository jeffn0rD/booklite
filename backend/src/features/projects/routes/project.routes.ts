/**
 * Project Routes
 * 
 * HTTP endpoints for project management.
 */

import { FastifyPluginAsync } from 'fastify';
import { ProjectService } from '../services/project.service.js';
import { authenticate } from '../../../shared/middleware/auth.middleware.js';
import { validateBody, validateQuery, validateParams } from '../../../shared/middleware/validation.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  projectIdParamSchema,
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsQuery,
  ProjectIdParam,
} from '../../../shared/schemas/project.schema.js';

export const projectRoutes: FastifyPluginAsync = async (fastify) => {
  const projectService = new ProjectService(fastify.supabase);

  fastify.get<{ Querystring: ListProjectsQuery }>(
    '/projects',
    { preHandler: [authenticate, validateQuery(listProjectsQuerySchema)] },
    async (request, reply) => {
      const projects = await projectService.list(request.user.id, request.query);
      return reply.status(200).send({
        data: projects,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.get<{ Params: ProjectIdParam }>(
    '/projects/:id',
    { preHandler: [authenticate, validateParams(projectIdParamSchema)] },
    async (request, reply) => {
      const project = await projectService.get(request.user.id, request.params.id);
      return reply.status(200).send({
        data: project,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.post<{ Body: CreateProjectInput }>(
    '/projects',
    { preHandler: [authenticate, validateBody(createProjectSchema)] },
    async (request, reply) => {
      const project = await projectService.create(request.user.id, request.body);
      return reply.status(201).send({
        data: project,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.put<{ Params: ProjectIdParam; Body: UpdateProjectInput }>(
    '/projects/:id',
    {
      preHandler: [
        authenticate,
        validateParams(projectIdParamSchema),
        validateBody(updateProjectSchema),
      ],
    },
    async (request, reply) => {
      const project = await projectService.update(request.user.id, request.params.id, request.body);
      return reply.status(200).send({
        data: project,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.delete<{ Params: ProjectIdParam }>(
    '/projects/:id',
    { preHandler: [authenticate, validateParams(projectIdParamSchema)] },
    async (request, reply) => {
      await projectService.delete(request.user.id, request.params.id);
      return reply.status(204).send();
    }
  );

  fastify.get<{ Params: ProjectIdParam }>(
    '/projects/:id/documents',
    { preHandler: [authenticate, validateParams(projectIdParamSchema)] },
    async (request, reply) => {
      const documents = await projectService.getDocuments(request.user.id, request.params.id);
      return reply.status(200).send({
        data: documents,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.get<{ Params: ProjectIdParam }>(
    '/projects/:id/expenses',
    { preHandler: [authenticate, validateParams(projectIdParamSchema)] },
    async (request, reply) => {
      const expenses = await projectService.getExpenses(request.user.id, request.params.id);
      return reply.status(200).send({
        data: expenses,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );
};