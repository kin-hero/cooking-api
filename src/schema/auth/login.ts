/**
 * Schema for POST /auth/login - User Login endpoint
 */
import { FastifySchema } from 'fastify';

export const loginSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
      },
      password: {
        type: 'string',
        minLength: 1,
        description: 'User password',
      },
    },
    required: ['email', 'password'],
    additionalProperties: false,
  },
} as const;
