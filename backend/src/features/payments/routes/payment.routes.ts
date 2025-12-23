/**
 * Payment Routes
 * 
 * HTTP endpoints for payment management.
 */

import { FastifyPluginAsync } from 'fastify';
import { PaymentService } from '../services/payment.service.js';
import { authenticate } from '../../../shared/middleware/auth.middleware.js';
import { validateBody, validateQuery, validateParams } from '../../../shared/middleware/validation.middleware.js';
import {
  createPaymentSchema,
  updatePaymentSchema,
  listPaymentsQuerySchema,
  paymentIdParamSchema,
  CreatePaymentInput,
  UpdatePaymentInput,
  ListPaymentsQuery,
  PaymentIdParam,
} from '../../../shared/schemas/payment.schema.js';

export const paymentRoutes: FastifyPluginAsync = async (fastify) => {
  const paymentService = new PaymentService(fastify.supabase);

  fastify.get<{ Querystring: ListPaymentsQuery }>(
    '/payments',
    { preHandler: [authenticate, validateQuery(listPaymentsQuerySchema)] },
    async (request, reply) => {
      const payments = await paymentService.list(request.user.id, request.query);
      return reply.status(200).send({
        data: payments,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.get<{ Params: PaymentIdParam }>(
    '/payments/:id',
    { preHandler: [authenticate, validateParams(paymentIdParamSchema)] },
    async (request, reply) => {
      const payment = await paymentService.get(request.user.id, request.params.id);
      return reply.status(200).send({
        data: payment,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.post<{ Body: CreatePaymentInput }>(
    '/payments',
    { preHandler: [authenticate, validateBody(createPaymentSchema)] },
    async (request, reply) => {
      const payment = await paymentService.create(request.user.id, request.body);
      return reply.status(201).send({
        data: payment,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.put<{ Params: PaymentIdParam; Body: UpdatePaymentInput }>(
    '/payments/:id',
    {
      preHandler: [
        authenticate,
        validateParams(paymentIdParamSchema),
        validateBody(updatePaymentSchema),
      ],
    },
    async (request, reply) => {
      const payment = await paymentService.update(request.user.id, request.params.id, request.body);
      return reply.status(200).send({
        data: payment,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.delete<{ Params: PaymentIdParam }>(
    '/payments/:id',
    { preHandler: [authenticate, validateParams(paymentIdParamSchema)] },
    async (request, reply) => {
      await paymentService.delete(request.user.id, request.params.id);
      return reply.status(204).send();
    }
  );
};