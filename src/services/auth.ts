import {
  createUser,
  findUserByEmail,
  getUserVerificationTokenExpiredAtTime,
  verifyUserEmailAddress,
} from '@/repositories/auth';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dayjs from 'dayjs';

export class AuthService {
  async registerUser(email: string, password: string, displayName: string) {
    // Validate input
    if (!email || !password || !displayName) {
      throw new Error('Email, password, and display name are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // verification token for email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const today = dayjs();
    const tomorrow = today.add(1, 'day').toDate();

    // Create user
    const user = await createUser(
      email,
      passwordHash,
      displayName,
      verificationToken,
      tomorrow
    );
    return user;
  }

  async verifyUserEmailFromToken(token: string, email: string) {
    if (!token) {
      throw new Error('Verification Token is required');
    }
    const currentTime = dayjs().toDate();
    const { emailFromDB, tokenTime } =
      await getUserVerificationTokenExpiredAtTime(email);

    if (!emailFromDB) {
      throw new Error('This email address does not exist');
    }
    if (!tokenTime) {
      throw new Error('This email has already been verified');
    }
    if (currentTime > tokenTime) {
      throw new Error('Verification time has expired');
    }

    await verifyUserEmailAddress(token, email);
  }
}
