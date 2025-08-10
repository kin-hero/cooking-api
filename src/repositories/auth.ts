import { prisma } from '@/lib/prisma';

export const findUserByEmail = async (email: string) => {
  return await prisma.users_cooking.findUnique({
    where: { email },
  });
};

export const createUser = async (
  email: string,
  passwordHash: string,
  displayName: string,
  verificationToken: string,
  verificationTokenTimeStamp: Date
) => {
  const user = await prisma.users_cooking.create({
    data: {
      email,
      password_hash: passwordHash,
      display_name: displayName,
      verification_token: verificationToken,
      verification_token_expired_at: verificationTokenTimeStamp,
    },
  });
  return user;
};

export const getUserVerificationTokenExpiredAtTime = async (email: string) => {
  const userVerificationTime = await prisma.users_cooking.findFirst({
    where: { email: email },
    select: { verification_token_expired_at: true, email: true },
  });
  return {
    emailFromDB: userVerificationTime?.email,
    tokenTime: userVerificationTime?.verification_token_expired_at,
  };
};

export const verifyUserEmailAddress = async (token: string, email: string) => {
  const verifiedUser = await prisma.users_cooking.update({
    where: {
      verification_token: token,
      email: email,
    },
    data: {
      email_verified: true,
      verification_token: null,
      verification_token_expired_at: null,
    },
  });
  return verifiedUser;
};

export const getUserData = async (email: string) => {
  const userData = await prisma.users_cooking.findUnique({
    where: { email: email },
    select: {
      password_hash: true,
      email_verified: true,
      display_name: true,
      id: true,
    },
  });
  return {
    isEmailVerified: userData?.email_verified,
    passwordHash: userData?.password_hash,
    displayName: userData?.display_name,
    userId: userData?.id,
  };
};

export const findUserByGoogleId = async (googleId: string) => {
  return await prisma.users_cooking.findUnique({
    where: { google_id: googleId },
  });
};

export const createGoogleUser = async (
  email: string,
  displayName: string,
  googleId: string,
  avatarUrl?: string
) => {
  return await prisma.users_cooking.create({
    data: {
      email,
      display_name: displayName,
      google_id: googleId,
      avatar_url: avatarUrl ?? null,
      email_verified: true, // Google users are pre-verified
      password_hash: null, // No password for OAuth users
    },
  });
};

export const findOrCreateGoogleUser = async (
  email: string,
  displayName: string,
  googleId: string,
  avatarUrl?: string
) => {
  // First try to find by Google ID
  let user = await findUserByGoogleId(googleId);

  if (user) {
    return user;
  }

  // Then try to find by email (existing user linking Google account)
  user = await findUserByEmail(email);

  if (user) {
    // Update existing user with Google ID
    return await prisma.users_cooking.update({
      where: { id: user.id },
      data: {
        google_id: googleId,
        avatar_url: avatarUrl ?? user.avatar_url,
        email_verified: true,
      },
    });
  }

  // Create new Google user
  return await createGoogleUser(email, displayName, googleId, avatarUrl);
};
