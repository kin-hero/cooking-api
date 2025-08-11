import { prisma } from '@/lib/prisma';

export const saveRecipeToDatabase = async (
  title: string,
  description: string,
  ingredients: string[],
  instructions: string[],
  prepTimeMinutes: number,
  cookingTimeMinutes: number,
  servingSize: number,
  imageUrl: string | null,
  isPublished: boolean,
  userId: string
) => {
  const recipes = await prisma.recipes.create({
    data: {
      title: title,
      description: description,
      ingredients: ingredients,
      instructions: instructions,
      prep_time_minutes: prepTimeMinutes,
      cooking_time_minutes: cookingTimeMinutes,
      serving_size: servingSize,
      image_url: imageUrl,
      is_published: isPublished,
      author_id: userId,
    },
  });
  return recipes;
};
