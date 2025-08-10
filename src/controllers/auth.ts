import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '@/services/auth';
import { JWTService } from '@/services/jwt';

const authService = new AuthService();
const jwtService = new JWTService();

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
        verificationToken: user.verification_token,
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

export interface VerifyEmailQuery {
  email: string;
  token: string;
}

export const verifyUserEmail = async (
  request: FastifyRequest<{ Querystring: VerifyEmailQuery }>,
  reply: FastifyReply
) => {
  try {
    const { email, token } = request.query;
    await authService.verifyUserEmailFromToken(token, email);
    return reply.status(201).send({
      success: true,
      message: "User's email address has been verified successfully",
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

export type LoginRequestBody = Pick<RegisterRequestBody, 'email' | 'password'>;

export const loginUser = async (
  request: FastifyRequest<{ Body: LoginRequestBody }>,
  reply: FastifyReply
) => {
  try {
    const { email, password } = request.body;
    const userLoginData = await authService.loginUserCredentials(
      email,
      password
    );
    const jwtToken = jwtService.generateAccessToken(
      userLoginData.userId,
      userLoginData.email
    );
    // Set HTTP-only cookie AND return in response
    reply.setCookie('recipe_token_user', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return reply.status(201).send({
      success: true,
      message: 'User has logged in successfully',
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
