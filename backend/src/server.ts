/**
 * Booklite API Server
 * 
 * Main entry point for the Fastify server.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { createClient } from '@supabase/supabase-js';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './shared/middleware/error.middleware.js';
import { clientRoutes } from './features/clients/routes/client.routes.js';

/**
 * Build Fastify server
 */
async function buildServer() {
  const server = Fastify({
    logger: {
      level: config.logging.level,
      transport: config.logging.prettyPrint
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'request_id',
    disableRequestLogging: false,
    trustProxy: true,
  });

  // Register plugins
  await server.register(cors, {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  });

  await server.register(helmet, {
    contentSecurityPolicy: config.server.isProduction,
  });

  await server.register(rateLimit, {
    max: config.rateLimit.global,
    timeWindow: '1 minute',
  });

  await server.register(sensible);

  // Decorate server with Supabase client
  const supabase = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey
  );
  server.decorate('supabase', supabase);

  // Decorate request with Supabase client
  server.decorateRequest('supabase', null);
  server.addHook('onRequest', async (request) => {
    request.supabase = supabase;
  });

  // Health check endpoint
  server.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.server.env,
    };
  });

  // API version endpoint
  server.get('/v1', async () => {
    return {
      version: '1.0.0',
      name: 'Booklite API',
      description: 'Lightweight bookkeeping for independent consultants',
    };
  });

  // Import all route modules
  const { documentRoutes } = await import('./features/documents/routes/document.routes.js');
  const { projectRoutes } = await import('./features/projects/routes/project.routes.js');
  const { paymentRoutes } = await import('./features/payments/routes/payment.routes.js');
  const { expenseRoutes } = await import('./features/expenses/routes/expense.routes.js');
  const { categoryRoutes } = await import('./features/categories/routes/category.routes.js');
  const { taxRateRoutes } = await import('./features/tax-rates/routes/tax-rate.routes.js');
  const { userProfileRoutes } = await import('./features/user-profile/routes/user-profile.routes.js');
  
  // Register feature routes
  await server.register(clientRoutes, { prefix: '/v1' });
  await server.register(documentRoutes, { prefix: '/v1' });
  await server.register(projectRoutes, { prefix: '/v1' });
  await server.register(paymentRoutes, { prefix: '/v1' });
  await server.register(expenseRoutes, { prefix: '/v1' });
  await server.register(categoryRoutes, { prefix: '/v1' });
  await server.register(taxRateRoutes, { prefix: '/v1' });
  await server.register(userProfileRoutes, { prefix: '/v1' });

  // Error handlers
  server.setErrorHandler(errorHandler);
  server.setNotFoundHandler(notFoundHandler);

  return server;
}

/**
 * Start server
 */
async function start() {
  try {
    const server = await buildServer();

    await server.listen({
      port: config.server.port,
      host: config.server.host,
    });

    server.log.info(
      `Server listening on ${config.server.host}:${config.server.port}`
    );
    server.log.info(`Environment: ${config.server.env}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start server if not in test mode
if (config.server.env !== 'test') {
  start();
}

export { buildServer };