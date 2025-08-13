/**
 * Schema for GET /auth/verify-email - Verify Email endpoint
 */
import { FastifySchema } from 'fastify';

export const verifyEmailSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        minLength: 1,
        description: 'Email verification token',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Email address to verify',
      },
    },
    required: ['token', 'email'],
    additionalProperties: false,
  },
} as const;
