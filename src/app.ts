import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';

import authRoutes from '@/routes/auth';
import recipeRoutes from '@/routes/recipes';
import userRoutes from '@/routes/users';

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  schemaErrorFormatter: (errors, dataVar) => {
    const error = errors[0];
    return new Error(`Invalid ${dataVar}: ${error.instancePath.replace('/', '') || error.schemaPath.split('/').pop()} ${error.message}`);
  },
});

const setupApp = async () => {
  // CORS plugin
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4000',
    credentials: true, //CRITICAL: Allows cookies in CORS requests
  });

  // Security plugin
  await fastify.register(helmet);

  // Rate limiting plugin
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes',
  });

  // Multipart form support
  await fastify.register(multipart, {
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB limit
    },
  });
  // Cookie plugin
  await fastify.register(cookie);

  // JWT plugin
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  });

  // Health check endpoint
  fastify.get('/health', async (_request, _reply) => {
    return {
      success: true,
      message: 'Cooking API is running',
      timestamp: new Date().toISOString(),
    };
  });

  // Register API routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(recipeRoutes, { prefix: '/api/recipes' });
  await fastify.register(userRoutes, { prefix: '/api/users' });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      success: false,
      error: `Route ${request.method}:${request.url} not found`,
    });
  });
  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    // Handle schema validation errors
    if (error.validation) {
      reply.code(400).send({
        success: false,
        error: `Invalid ${error.validationContext}: ${error.message}`,
      });
      return;
    }

    // Handle other HTTP errors
    const statusCode = error.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode >= 500 ? 'Internal Server Error' : error.message;

    reply.code(statusCode).send({
      success: false,
      error: message,
    });
  });
  return fastify;
};

// Register plugins
const startServer = async () => {
  try {
    await setupApp();
    // Start server
    const PORT = Number(process.env.PORT) || 3000;
    const address = await fastify.listen({
      port: PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Cooking API server running at ${address}`);
    console.log(`📖 Health check: ${address}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`${signal} signal received: closing HTTP server`);
  try {
    await fastify.close();
    console.log('HTTP server closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (require.main === module) {
  startServer();
}

let configuredApp: any = null;
export const getApp = async () => {
  if (!configuredApp) {
    configuredApp = await setupApp();
  }
  return configuredApp;
};

export default fastify;
