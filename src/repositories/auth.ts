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
