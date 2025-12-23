/**
 * Validation Middleware
 * 
 * Validates request data against Zod schemas.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema } from 'zod';
import { zodErrorToValidationError } from '../errors/index.js';

/**
 * Validate request body
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      throw zodErrorToValidationError(error);
    }
  };
}

/**
 * Validate request query parameters
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      request.query = schema.parse(request.query);
    } catch (error) {
      throw zodErrorToValidationError(error);
    }
  };
}

/**
 * Validate request params
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      request.params = schema.parse(request.params);
    } catch (error) {
      throw zodErrorToValidationError(error);
    }
  };
}