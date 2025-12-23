/**
 * Tax Rate Routes
 * 
 * HTTP endpoints for tax rate management.
 */

import { FastifyPluginAsync } from 'fastify';
import { TaxRateService } from '../services/tax-rate.service.js';
import { authenticate } from '../../../shared/middleware/auth.middleware.js';
import { validateBody, validateQuery, validateParams } from '../../../shared/middleware/validation.middleware.js';
import {
  createTaxRateSchema,
  updateTaxRateSchema,
  listTaxRatesQuerySchema,
  taxRateIdParamSchema,
  CreateTaxRateInput,
  UpdateTaxRateInput,
  ListTaxRatesQuery,
  TaxRateIdParam,
} from '../../../shared/schemas/tax-rate.schema.js';

export const taxRateRoutes: FastifyPluginAsync = async (fastify) => {
  const taxRateService = new TaxRateService(fastify.supabase);

  fastify.get<{ Querystring: ListTaxRatesQuery }>(
    '/tax-rates',
    { preHandler: [authenticate, validateQuery(listTaxRatesQuerySchema)] },
    async (request, reply) => {
      const taxRates = await taxRateService.list(request.user.id, request.query);
      return reply.status(200).send({
        data: taxRates,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.get<{ Params: TaxRateIdParam }>(
    '/tax-rates/:id',
    { preHandler: [authenticate, validateParams(taxRateIdParamSchema)] },
    async (request, reply) => {
      const taxRate = await taxRateService.get(request.user.id, request.params.id);
      return reply.status(200).send({
        data: taxRate,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.post<{ Body: CreateTaxRateInput }>(
    '/tax-rates',
    { preHandler: [authenticate, validateBody(createTaxRateSchema)] },
    async (request, reply) => {
      const taxRate = await taxRateService.create(request.user.id, request.body);
      return reply.status(201).send({
        data: taxRate,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.put<{ Params: TaxRateIdParam; Body: UpdateTaxRateInput }>(
    '/tax-rates/:id',
    {
      preHandler: [
        authenticate,
        validateParams(taxRateIdParamSchema),
        validateBody(updateTaxRateSchema),
      ],
    },
    async (request, reply) => {
      const taxRate = await taxRateService.update(request.user.id, request.params.id, request.body);
      return reply.status(200).send({
        data: taxRate,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  fastify.delete<{ Params: TaxRateIdParam }>(
    '/tax-rates/:id',
    { preHandler: [authenticate, validateParams(taxRateIdParamSchema)] },
    async (request, reply) => {
      await taxRateService.delete(request.user.id, request.params.id);
      return reply.status(204).send();
    }
  );
};