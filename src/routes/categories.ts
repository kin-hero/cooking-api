import { FastifyPluginAsync } from 'fastify';

const categoryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    return { success: true, message: 'Get all categories - TODO' };
  });

  fastify.post('/', async (request, reply) => {
    return { success: true, message: 'Create category - TODO' };
  });
};

export default categoryRoutes;