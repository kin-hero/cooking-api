import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { JWTService, JWTPayload } from '@/services/jwt';

// Create a custom interface that extends FastifyRequest
interface AuthenticatedRequest extends FastifyRequest {
  user: JWTPayload;
}

export const authenticateToken = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void => {
  const jwtService = new JWTService();

  const userToken = request.cookies.recipe_token_user;

  // Check if token exists
  if (!userToken) {
    reply.code(401).send({
      success: false,
      error: 'Access token is required',
    });
    return;
  }

  try {
    const decodedToken = jwtService.verifyAccessToken(userToken);
    // Store user info in request object
    (request as AuthenticatedRequest).user = decodedToken;
    // Continue to the route handler
    done();
  } catch (error) {
    console.log('❌ Token verification failed:', error);
    reply.code(401).send({
      success: false,
      error: 'Invalid or expired token',
    });
    return;
  }
};

export default authenticateToken;
