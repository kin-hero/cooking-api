import { FastifyPluginAsync } from 'fastify';

const recipeRoutes: FastifyPluginAsync = async (fastify) => {
  // Public routes (no auth required)
  fastify.get('/', async (request, reply) => {
    return { success: true, message: 'Get all recipes - TODO' };
  });

  fastify.get('/:id', async (request, reply) => {
    return { success: true, message: 'Get recipe by ID - TODO' };
  });

  // Protected routes (auth required)
  fastify.post('/', async (request, reply) => {
    return { success: true, message: 'Create recipe - TODO' };
  });

  fastify.put('/:id', async (request, reply) => {
    return { success: true, message: 'Update recipe - TODO' };
  });

  fastify.delete('/:id', async (request, reply) => {
    return { success: true, message: 'Delete recipe - TODO' };
  });
};

export default recipeRoutes;