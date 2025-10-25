import {
  createUser,
  findUserByEmail,
  getUserData,
  getUserVerificationTokenExpiredAtTime,
  verifyUserEmailAddress,
} from '@/repositories/auth';
import { EmailService } from './email';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dayjs from 'dayjs';

export class AuthService {
  private saltRounds: number;
  private emailService: EmailService;

  constructor() {
    this.saltRounds = 12;
    this.emailService = new EmailService();
  }
  private async encryptUserPassword(password: string) {
    const passwordHash = await bcrypt.hash(password, this.saltRounds);
    return passwordHash;
  }

  async registerUser(email: string, password: string, displayName: string) {
    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser?.google_id) {
      throw new Error('User has sign in via Google');
    }
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
    const user = await createUser(email, passwordHash, displayName, verificationToken, tomorrow);

    // Send email verification link
    const emailResult = await this.emailService.sendVerificationEmail(email, displayName, verificationToken);
    if (emailResult.success) {
      console.log(`Verification email sent successfully to ${email}`);
    } else {
      console.error(`Failed to send verification email to ${email}:`, emailResult.error);
      // Note: We don't throw - user is already registered
    }

    return user;
  }

  async verifyUserEmailFromToken(token: string, email: string) {
    const currentTime = dayjs().toDate();
    const { emailFromDB, tokenTime } = await getUserVerificationTokenExpiredAtTime(email);

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
    const { isEmailVerified, passwordHash, displayName, userId } = await getUserData(email);

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
