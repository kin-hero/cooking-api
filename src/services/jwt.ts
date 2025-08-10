import jwt, { Algorithm } from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class JWTService {
  private jwtSecret: string;
  private accessTokenExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
  }

  generateAccessToken(userId: string, email: string): string {
    const payload: JWTPayload = {
      userId,
      email,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiresIn,
      algorithm: 'HS256' as Algorithm,
    });
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
