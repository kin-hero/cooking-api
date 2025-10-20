import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '@/services/auth';
import { JWTService } from '@/services/jwt';
import { GoogleOAuthService } from '@/services/googleOAuth';
import { findOrCreateGoogleUser } from '@/repositories/auth';
import handleError from '@/utils/errorHandler';

const authService = new AuthService();
const jwtService = new JWTService();
const googleOAuthService = new GoogleOAuthService();

export interface RegisterRequestBody {
  email: string;
  password: string;
  displayName: string;
}

export const registerUser = async (request: FastifyRequest<{ Body: RegisterRequestBody }>, reply: FastifyReply) => {
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
    return handleError(reply, error);
  }
};

export interface VerifyEmailQuery {
  email: string;
  token: string;
}

export const verifyUserEmail = async (request: FastifyRequest<{ Querystring: VerifyEmailQuery }>, reply: FastifyReply) => {
  try {
    const { email, token } = request.query;
    await authService.verifyUserEmailFromToken(token, email);
    return reply.status(200).send({
      success: true,
      message: "User's email address has been verified successfully",
    });
  } catch (error) {
    return handleError(reply, error);
  }
};

export type LoginRequestBody = Pick<RegisterRequestBody, 'email' | 'password'>;

export const loginUser = async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) => {
  try {
    const { email, password } = request.body;
    const userLoginData = await authService.loginUserCredentials(email, password);
    const jwtToken = jwtService.generateAccessToken(userLoginData.userId, userLoginData.email);
    // Set HTTP-only cookie AND return in response
    reply.setCookie('recipe_token_user', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/', // Allow cookie to be sent to all routes
    });

    return reply.status(201).send({
      success: true,
      message: 'User has logged in successfully',
    });
  } catch (error) {
    return handleError(reply, error);
  }
};

export const logoutUser = async (reply: FastifyReply) => {
  try {
    reply.clearCookie('recipe_token_user', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Log successful logout for monitoring
    console.log('User logged out successfully');

    return reply.status(200).send({
      success: true,
      message: 'User has logged out successfully',
    });
  } catch (error) {
    // Even logout errors should succeed to prevent UX issues
    console.error('Logout error:', error);
    return handleError(reply, error);
  }
};

export const initiateGoogleAuth = async (reply: FastifyReply) => {
  try {
    const authURL = googleOAuthService.generateAuthURL();
    return reply.redirect(authURL);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return handleError(reply, error);
  }
};

export const handleGoogleCallback = async (
  request: FastifyRequest<{ Querystring: { code?: string; error?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { code, error } = request.query;

    if (error) {
      console.error('Google OAuth error:', error);
      return reply.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }

    if (!code) {
      console.error('No authorization code received from Google');
      return reply.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    // Get user info from Google
    const googleUser = await googleOAuthService.getGoogleUser(code);

    // Create or find user in our database
    const user = await findOrCreateGoogleUser(googleUser.email, googleUser.name, googleUser.id, googleUser.picture);

    // Generate JWT token using your existing system
    const jwtToken = jwtService.generateAccessToken(user.id, user.email);

    // Set the same cookie as your regular login
    reply.setCookie('recipe_token_user', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/', // Allow cookie to be sent to all routes
    });

    // Log successful login
    console.log(`Google OAuth login successful for ${user.email}`);

    // Redirect to frontend dashboard
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return reply.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return reply.redirect(`${frontendUrl}/login?error=oauth_callback_failed`);
  }
};
