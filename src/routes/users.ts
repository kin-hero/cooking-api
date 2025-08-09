import { FastifyPluginAsync } from 'fastify';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/profile', async (request, reply) => {
    return { success: true, message: 'Get user profile - TODO' };
  });

  fastify.put('/profile', async (request, reply) => {
    return { success: true, message: 'Update user profile - TODO' };
  });

  fastify.get('/:id/recipes', async (request, reply) => {
    return { success: true, message: 'Get user recipes - TODO' };
  });
};

export default userRoutes;