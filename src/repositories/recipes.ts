import { prisma } from '@/lib/prisma';

// New: Transactional recipe creation with image processing
export const createRecipeWithImagesTransaction = async (
  recipeData: {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTimeMinutes: number;
    cookingTimeMinutes: number;
    servingSize: number;
    isPublished: boolean;
    userId: string;
  },
  imageProcessingCallback: (recipeId: string) => Promise<{ thumbnailImageUrl: string; largeImageUrl: string }>
) => {
  return await prisma.$transaction(async tx => {
    // 1. Create recipe in transaction
    const recipe = await tx.recipes.create({
      data: {
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        prep_time_minutes: recipeData.prepTimeMinutes,
        cooking_time_minutes: recipeData.cookingTimeMinutes,
        serving_size: recipeData.servingSize,
        is_published: recipeData.isPublished,
        author_id: recipeData.userId,
      },
    });

    // 2. Process images (callback handles external operations)
    const { thumbnailImageUrl, largeImageUrl } = await imageProcessingCallback(recipe.id);

    // 3. Update with image URLs in same transaction
    await tx.recipes.update({
      where: { id: recipe.id },
      data: {
        thumbnail_image_url: thumbnailImageUrl,
        large_image_url: largeImageUrl,
      },
    });

    return recipe;
  });
};

export const saveRecipeWithoutImages = async (recipeData: {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookingTimeMinutes: number;
  servingSize: number;
  isPublished: boolean;
  userId: string;
}) => {
  const recipe = await prisma.recipes.create({
    data: {
      title: recipeData.title,
      description: recipeData.description,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      prep_time_minutes: recipeData.prepTimeMinutes,
      cooking_time_minutes: recipeData.cookingTimeMinutes,
      serving_size: recipeData.servingSize,
      is_published: recipeData.isPublished,
      author_id: recipeData.userId,
    },
  });
  return recipe;
};
