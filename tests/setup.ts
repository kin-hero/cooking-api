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

beforeEach(async () => {
  // Clean up before each test
  await prisma.recipeCategory.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.ingredient.deleteMany();
});

export { prisma };
