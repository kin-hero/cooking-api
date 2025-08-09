import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';

import authRoutes from '@/routes/auth';
import recipeRoutes from '@/routes/recipes';
import userRoutes from '@/routes/users';
import categoryRoutes from '@/routes/categories';


// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Register plugins
const startServer = async () => {
  try {
    // CORS plugin
    await fastify.register(cors, {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
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
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    });

    // JWT plugin
    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    });

    // Health check endpoint
    fastify.get('/health', async (request, reply) => {
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
    await fastify.register(categoryRoutes, { prefix: '/api/categories' });

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

      // Handle different error types
      if (error.validation) {
        reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.validation,
        });
        return;
      }

      const statusCode = error.statusCode || 500;
      const message = process.env.NODE_ENV === 'production' && statusCode >= 500
        ? 'Internal Server Error'
        : error.message;

      reply.code(statusCode).send({
        success: false,
        error: message,
      });
    });

    // Start server
    const PORT = Number(process.env.PORT) || 3000;
    const address = await fastify.listen({ 
      port: PORT, 
      host: '0.0.0.0' 
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

// Start the server
startServer();

export default fastify;