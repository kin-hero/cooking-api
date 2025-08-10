import { FastifyPluginAsync } from 'fastify';
import authenticateToken from '@/middleware/auth';

const recipeRoutes: FastifyPluginAsync = async fastify => {
  // Public routes (no auth required)
  fastify.get('/', async (_request, _reply) => {
    return { success: true, message: 'Get all recipes - TODO' };
  });

  fastify.get('/:id', async (_request, _reply) => {
    return { success: true, message: 'Get recipe by ID - TODO' };
  });

  // Protected routes (auth required)
  fastify.post(
    '/',
    { preHandler: authenticateToken },
    async (request, _reply) => {
      console.log('Request User', request.user);
      return { success: true, message: 'Create recipe - TODO' };
    }
  );

  fastify.put('/:id', async (_request, _reply) => {
    return { success: true, message: 'Update recipe - TODO' };
  });

  fastify.delete('/:id', async (_request, _reply) => {
    return { success: true, message: 'Delete recipe - TODO' };
  });
};

export default recipeRoutes;
