import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
