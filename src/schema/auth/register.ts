/**
 * Schema for POST /auth/register - User Registration endpoint
 */
import { FastifySchema } from 'fastify';

export const registerSchema: FastifySchema = {
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
        minLength: 6,
        description: 'User password (minimum 6 characters)',
      },
      displayName: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'User display name',
      },
    },
    required: ['email', 'password', 'displayName'],
    additionalProperties: false,
  },
} as const;
