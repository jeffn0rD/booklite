/**
 * Authentication Middleware
 * 
 * Validates JWT tokens and attaches user to request.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../errors/index.js';

/**
 * Authenticate middleware
 * 
 * Validates JWT token from Authorization header and attaches user to request.
 * Uses Supabase Auth for token validation.
 */
export async function authenticate(
  request: FastifyRequest
): Promise<void> {
  try {
    // Get authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    // Extract token
    const token = authHeader.substring(7);

    // Validate token with Supabase
    const { data: { user }, error } = await request.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Attach user to request
    request.user = user as any;

  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    
    throw new UnauthorizedError('Authentication failed');
  }
}

/**
 * Optional authentication middleware
 * 
 * Attempts to authenticate but doesn't fail if no token is provided.
 * Useful for endpoints that have different behavior for authenticated users.
 */
export async function optionalAuthenticate(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return; // No token, continue without user
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await request.supabase.auth.getUser(token);

    if (!error && user) {
      request.user = user as any;
    }
  } catch {
    // Silently fail for optional auth
  }
}