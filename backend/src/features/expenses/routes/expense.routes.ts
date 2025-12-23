/**
 * Expense Routes
 * 
 * HTTP endpoints for expense management.
 */

import { FastifyPluginAsync } from 'fastify';
import { ExpenseService } from '../services/expense.service.js';
import { authenticate } from '../../../shared/middleware/auth.middleware.js';
import { validateBody, validateQuery, validateParams } from '../../../shared/middleware/validation.middleware.js';
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
  expenseIdParamSchema,
  CreateExpenseInput,
  UpdateExpenseInput,
  ListExpensesQuery,
  ExpenseIdParam,
} from '../../../shared/schemas/expense.schema.js';

export const expenseRoutes: FastifyPluginAsync = async (fastify) => {
  const expenseService = new ExpenseService(fastify.supabase);

  fastify.get<{ Querystring: ListExpensesQuery }>(
    '/expenses',
    { preHandler: [authenticate, validateQuery(listExpensesQuerySchema)] },
    async (request, reply) => {
      const expenses = await expenseService.list(request.user.id, request.query);
      return reply.status(200).send({
        data: expenses,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.get<{ Params: ExpenseIdParam }>(
    '/expenses/:id',
    { preHandler: [authenticate, validateParams(expenseIdParamSchema)] },
    async (request, reply) => {
      const expense = await expenseService.get(request.user.id, request.params.id);
      return reply.status(200).send({
        data: expense,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.post<{ Body: CreateExpenseInput }>(
    '/expenses',
    { preHandler: [authenticate, validateBody(createExpenseSchema)] },
    async (request, reply) => {
      const expense = await expenseService.create(request.user.id, request.body);
      return reply.status(201).send({
        data: expense,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.put<{ Params: ExpenseIdParam; Body: UpdateExpenseInput }>(
    '/expenses/:id',
    {
      preHandler: [
        authenticate,
        validateParams(expenseIdParamSchema),
        validateBody(updateExpenseSchema),
      ],
    },
    async (request, reply) => {
      const expense = await expenseService.update(request.user.id, request.params.id, request.body);
      return reply.status(200).send({
        data: expense,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.delete<{ Params: ExpenseIdParam }>(
    '/expenses/:id',
    { preHandler: [authenticate, validateParams(expenseIdParamSchema)] },
    async (request, reply) => {
      await expenseService.delete(request.user.id, request.params.id);
      return reply.status(204).send();
    }
  );
};