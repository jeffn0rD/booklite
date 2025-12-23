/**
 * Error Handling Middleware
 * 
 * Global error handler for consistent error responses.
 */

import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { 
  ApiError, 
  isApiError, 
  zodErrorToValidationError,
  dbErrorToApiError,
  InternalServerError 
} from '../errors/index.js';

/**
 * Error handler
 * 
 * Converts all errors to RFC 7807 compliant error responses.
 */
export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Log error for debugging
  request.log.error({
    error: error,
    url: request.url,
    method: request.method,
    user: request.user?.id,
  }, 'Request error');

  let apiError: ApiError;

  // Convert error to ApiError
  if (isApiError(error)) {
    apiError = error;
  } else if (error instanceof ZodError) {
    apiError = zodErrorToValidationError(error);
  } else if (error.name === 'PostgrestError' || error.name === 'DatabaseError') {
    apiError = dbErrorToApiError(error);
  } else if ('statusCode' in error && error.statusCode) {
    // Fastify HTTP errors
    apiError = new ApiError(
      `https://api.booklite.app/errors/${error.name.toLowerCase()}`,
      error.name,
      error.statusCode,
      error.message
    );
  } else {
    // Unknown error - return generic 500
    apiError = new InternalServerError(
      process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An unexpected error occurred'
    );
  }

  // Send error response
  reply.status(apiError.status).send({
    ...apiError.toJSON(),
    instance: request.url,
    meta: {
      timestamp: new Date().toISOString(),
      request_id: request.id,
    },
  });
}

/**
 * Not found handler
 * 
 * Handles 404 errors for undefined routes.
 */
export async function notFoundHandler(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  reply.status(404).send({
    type: 'https://api.booklite.app/errors/not-found',
    title: 'Not Found',
    status: 404,
    detail: `Route ${request.method} ${request.url} not found`,
    instance: request.url,
    meta: {
      timestamp: new Date().toISOString(),
      request_id: request.id,
    },
  });
}