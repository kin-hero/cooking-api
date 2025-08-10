import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import {
  registerUser,
  RegisterRequestBody,
  VerifyEmailQuery,
  verifyUserEmail,
  LoginRequestBody,
  loginUser,
} from '@/controllers/auth';

const authRoutes: FastifyPluginAsync = async fastify => {
  fastify.post(
    '/register',
    async (request: FastifyRequest<{ Body: RegisterRequestBody }>, reply) => {
      await registerUser(request, reply);
    }
  );

  fastify.get(
    '/verify-email',
    async (
      request: FastifyRequest<{ Querystring: VerifyEmailQuery }>,
      reply
    ) => {
      await verifyUserEmail(request, reply);
    }
  );

  fastify.post(
    '/login',
    async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply) => {
      await loginUser(request, reply);
    }
  );

  fastify.get('/google', async (_request, _reply) => {
    return { success: true, message: 'Google OAuth endpoint - TODO' };
  });

  fastify.get('/google/callback', async (_request, _reply) => {
    return { success: true, message: 'Google OAuth callback - TODO' };
  });

  fastify.post('/refresh', async (_request, _reply) => {
    return { success: true, message: 'Refresh token endpoint - TODO' };
  });

  fastify.post('/logout', async (_request, _reply) => {
    return { success: true, message: 'Logout endpoint - TODO' };
  });
};

export default authRoutes;
