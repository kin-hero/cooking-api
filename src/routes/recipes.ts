import { FastifyPluginAsync } from 'fastify';
import authenticateToken from '@/middleware/auth';
import { createRecipe } from '@/controllers/recipes';

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
    {
      preHandler: authenticateToken,
    },
    async (request, reply) => {
      await createRecipe(request, reply);
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
