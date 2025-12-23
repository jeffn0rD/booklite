/**
 * Custom Error Classes
 * 
 * RFC 7807 compliant error classes for consistent error handling.
 */

/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(
    public type: string,
    public title: string,
    public status: number,
    public detail: string,
    public errors?: Array<{ field: string; message: string; code: string }>
  ) {
    super(detail);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.detail,
      ...(this.errors && { errors: this.errors }),
    };
  }
}

/**
 * 400 Bad Request - Validation Error
 */
export class ValidationError extends ApiError {
  constructor(
    detail: string,
    errors: Array<{ field: string; message: string; code: string }>
  ) {
    super(
      'https://api.booklite.app/errors/validation-error',
      'Validation Error',
      400,
      detail,
      errors
    );
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends ApiError {
  constructor(detail: string = 'Unauthorized') {
    super(
      'https://api.booklite.app/errors/unauthorized',
      'Unauthorized',
      401,
      detail
    );
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends ApiError {
  constructor(detail: string = 'Forbidden') {
    super(
      'https://api.booklite.app/errors/forbidden',
      'Forbidden',
      403,
      detail
    );
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string | number) {
    const detail = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(
      'https://api.booklite.app/errors/not-found',
      'Not Found',
      404,
      detail
    );
  }
}

/**
 * 409 Conflict - Duplicate Resource
 */
export class ConflictError extends ApiError {
  constructor(detail: string) {
    super(
      'https://api.booklite.app/errors/conflict',
      'Conflict',
      409,
      detail
    );
  }
}

/**
 * 422 Unprocessable Entity - Business Logic Error
 */
export class BusinessLogicError extends ApiError {
  constructor(detail: string) {
    super(
      'https://api.booklite.app/errors/business-logic-error',
      'Business Logic Error',
      422,
      detail
    );
  }
}

/**
 * 429 Too Many Requests
 */
export class RateLimitError extends ApiError {
  constructor(detail: string = 'Rate limit exceeded') {
    super(
      'https://api.booklite.app/errors/rate-limit-exceeded',
      'Rate Limit Exceeded',
      429,
      detail
    );
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(detail: string = 'Internal server error') {
    super(
      'https://api.booklite.app/errors/internal-server-error',
      'Internal Server Error',
      500,
      detail
    );
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(detail: string = 'Service temporarily unavailable') {
    super(
      'https://api.booklite.app/errors/service-unavailable',
      'Service Unavailable',
      503,
      detail
    );
  }
}

/**
 * Helper function to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Helper function to convert Zod errors to ValidationError
 */
export function zodErrorToValidationError(zodError: any): ValidationError {
  const errors = zodError.errors.map((err: any) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code.toUpperCase(),
  }));

  return new ValidationError('Request validation failed', errors);
}

/**
 * Helper function to convert database errors to ApiError
 */
export function dbErrorToApiError(error: any): ApiError {
  // PostgreSQL error codes
  if (error.code === '23505') {
    return new ConflictError('Resource already exists');
  }
  if (error.code === '23503') {
    return new BusinessLogicError('Referenced resource does not exist');
  }
  if (error.code === '23514') {
    return new BusinessLogicError('Check constraint violation');
  }

  // Supabase error codes
  if (error.code === 'PGRST116') {
    return new NotFoundError('Resource');
  }

  // Default to internal server error
  return new InternalServerError(
    process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
  );
}