/**
 * User Profile Routes
 * 
 * HTTP endpoints for user profile management.
 */

import { FastifyPluginAsync } from 'fastify';
import { UserProfileService } from '../services/user-profile.service.js';
import { authenticate } from '../../../shared/middleware/auth.middleware.js';
import { validateBody } from '../../../shared/middleware/validation.middleware.js';
import {
  updateUserProfileSchema,
  UpdateUserProfileInput,
} from '../../../shared/schemas/user-profile.schema.js';

export const userProfileRoutes: FastifyPluginAsync = async (fastify) => {
  const userProfileService = new UserProfileService(fastify.supabase);

  /**
   * Get user profile
   * GET /user-profile
   */
  fastify.get(
    '/user-profile',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const profile = await userProfileService.get(request.user.id);
      return reply.status(200).send({
        data: profile,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );

  /**
   * Update user profile
   * PUT /user-profile
   */
  fastify.put<{ Body: UpdateUserProfileInput }>(
    '/user-profile',
    { preHandler: [authenticate, validateBody(updateUserProfileSchema)] },
    async (request, reply) => {
      const profile = await userProfileService.update(request.user.id, request.body);
      return reply.status(200).send({
        data: profile,
        meta: { timestamp: new Date().toISOString(), request_id: request.id },
      });
    }
  );
};