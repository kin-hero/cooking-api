import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import {
  registerUser,
  RegisterRequestBody,
  VerifyEmailQuery,
  verifyUserEmail,
  LoginRequestBody,
  loginUser,
  logoutUser,
  initiateGoogleAuth,
  handleGoogleCallback,
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

  fastify.get('/google', async (_request, reply) => {
    await initiateGoogleAuth(reply);
  });

  fastify.get(
    '/google/callback',
    async (
      request: FastifyRequest<{
        Querystring: { code?: string; error?: string };
      }>,
      reply
    ) => {
      await handleGoogleCallback(request, reply);
    }
  );

  fastify.post('/logout', async (_request, reply) => {
    await logoutUser(reply);
  });
};

export default authRoutes;
