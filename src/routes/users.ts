import { FastifyPluginAsync } from 'fastify';

const userRoutes: FastifyPluginAsync = async fastify => {
  fastify.get('/profile', async (_request, _reply) => {
    return { success: true, message: 'Get user profile - TODO' };
  });

  fastify.put('/profile', async (_request, _reply) => {
    return { success: true, message: 'Update user profile - TODO' };
  });

  fastify.get('/:id/recipes', async (_request, _reply) => {
    return { success: true, message: 'Get user recipes - TODO' };
  });
};

export default userRoutes;
