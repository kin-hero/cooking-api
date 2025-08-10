import {
  createUser,
  findUserByEmail,
  getUserData,
  getUserVerificationTokenExpiredAtTime,
  verifyUserEmailAddress,
} from '@/repositories/auth';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dayjs from 'dayjs';

export class AuthService {
  private saltRounds: number;

  constructor() {
    this.saltRounds = 12;
  }
  private async encryptUserPassword(password: string) {
    const passwordHash = await bcrypt.hash(password, this.saltRounds);
    return passwordHash;
  }

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
    const passwordHash = await this.encryptUserPassword(password);

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

  async loginUserCredentials(email: string, password: string) {
    if (!email || !password) {
      throw new Error('Email address or password are needed for login');
    }

    const { isEmailVerified, passwordHash, displayName, userId } =
      await getUserData(email);

    // Check if user exists
    if (!passwordHash) {
      console.error(`Login failed for ${email}: User not found`);
      throw new Error('Invalid email or password');
    }

    // Check if email is verified
    if (!isEmailVerified) {
      console.error(`Login failed for ${email}: Email not verified`);
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, passwordHash);
    if (!isPasswordCorrect) {
      console.error(`Login failed for ${email}: Wrong password`);
      throw new Error('Invalid email or password');
    }

    // Validate user data integrity
    if (!displayName || !userId) {
      console.error(`Login failed for ${email}: Missing user data`);
      throw new Error('Invalid email or password');
    }

    // Success - log for monitoring
    console.log(`Login successful for ${email}`);
    return {
      email,
      displayName,
      userId,
    };
  }
}
