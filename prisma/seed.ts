import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Breakfast' },
      update: {},
      create: {
        name: 'Breakfast',
        description: 'Morning meals and brunch dishes',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Lunch' },
      update: {},
      create: {
        name: 'Lunch',
        description: 'Midday meals and light dishes',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Dinner' },
      update: {},
      create: {
        name: 'Dinner',
        description: 'Evening meals and hearty dishes',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Dessert' },
      update: {},
      create: {
        name: 'Dessert',
        description: 'Sweet treats and desserts',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Vegetarian' },
      update: {},
      create: {
        name: 'Vegetarian',
        description: 'Plant-based dishes',
      },
    }),
  ]);

  // Create ingredients
  const ingredients = await Promise.all([
    prisma.ingredient.upsert({
      where: { name: 'Flour' },
      update: {},
      create: { name: 'Flour', unit: 'cups' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Sugar' },
      update: {},
      create: { name: 'Sugar', unit: 'cups' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Eggs' },
      update: {},
      create: { name: 'Eggs', unit: 'pieces' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Milk' },
      update: {},
      create: { name: 'Milk', unit: 'cups' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Butter' },
      update: {},
      create: { name: 'Butter', unit: 'tbsp' },
    }),
  ]);

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@cooking.com' },
    update: {},
    create: {
      email: 'demo@cooking.com',
      username: 'demo_chef',
      firstName: 'Demo',
      lastName: 'Chef',
      password: hashedPassword,
      isVerified: true,
      bio: 'Demo chef account for testing the cooking API',
    },
  });

  // Create a sample recipe
  const sampleRecipe = await prisma.recipe.create({
    data: {
      title: 'Simple Pancakes',
      description: 'Fluffy and delicious pancakes perfect for breakfast',
      instructions: [
        { step: 1, instruction: 'Mix dry ingredients in a large bowl' },
        { step: 2, instruction: 'Whisk wet ingredients in another bowl' },
        { step: 3, instruction: 'Combine wet and dry ingredients until just mixed' },
        { step: 4, instruction: 'Cook on griddle until bubbles form, then flip' },
        { step: 5, instruction: 'Serve hot with syrup' },
      ],
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'EASY',
      authorId: demoUser.id,
    },
  });

  // Add ingredients to the recipe
  await Promise.all([
    prisma.recipeIngredient.create({
      data: {
        recipeId: sampleRecipe.id,
        ingredientId: ingredients[0].id, // Flour
        quantity: '2',
        unit: 'cups',
      },
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: sampleRecipe.id,
        ingredientId: ingredients[1].id, // Sugar
        quantity: '2',
        unit: 'tbsp',
      },
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: sampleRecipe.id,
        ingredientId: ingredients[2].id, // Eggs
        quantity: '2',
        unit: 'pieces',
      },
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: sampleRecipe.id,
        ingredientId: ingredients[3].id, // Milk
        quantity: '1.5',
        unit: 'cups',
      },
    }),
  ]);

  // Add categories to the recipe
  await Promise.all([
    prisma.recipeCategory.create({
      data: {
        recipeId: sampleRecipe.id,
        categoryId: categories[0].id, // Breakfast
      },
    }),
    prisma.recipeCategory.create({
      data: {
        recipeId: sampleRecipe.id,
        categoryId: categories[4].id, // Vegetarian
      },
    }),
  ]);

  console.log('Database seeded successfully!');
  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${ingredients.length} ingredients`);
  console.log(`Created demo user: ${demoUser.email}`);
  console.log(`Created sample recipe: ${sampleRecipe.title}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });