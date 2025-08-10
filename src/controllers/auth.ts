import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '@/services/auth';

const authService = new AuthService();

export interface RegisterRequestBody {
  email: string;
  password: string;
  displayName: string;
}

export const registerUser = async (
  request: FastifyRequest<{ Body: RegisterRequestBody }>,
  reply: FastifyReply
) => {
  try {
    const { email, password, displayName } = request.body;
    const user = await authService.registerUser(email, password, displayName);
    return reply.status(201).send({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        emailVerified: user.email_verified,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
    });
  }
};
