import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        String(process.env.DATABASE_URL) ||
        'postgresql://postgres:postgres@localhost:5432/cooking_test',
    },
  },
});

beforeAll(async () => {
  // Clear database before tests
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up after tests
  await prisma.$disconnect();
});

beforeEach(async () => {});

export { prisma };
