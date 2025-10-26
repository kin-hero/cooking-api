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
  imageProcessingCallback: (recipeId: string) => Promise<{ thumbnailUrl: string; largeUrl: string }>
) => {
  return await prisma.$transaction(
    async tx => {
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
      const { thumbnailUrl, largeUrl } = await imageProcessingCallback(recipe.id);

      // 3. Update with image URLs in same transaction
      await tx.recipes.update({
        where: { id: recipe.id },
        data: {
          thumbnail_image_url: thumbnailUrl,
          large_image_url: largeUrl,
        },
      });

      return recipe;
    },
    {
      timeout: 60000, // 60 seconds timeout for S3 operations
    }
  );
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

export const fetchRecipesUsingOffsetAndLimit = async (offset: number, limit: number) => {
  const recipeData = await prisma.recipes.findMany({
    select: {
      id: true,
      title: true,
      prep_time_minutes: true,
      cooking_time_minutes: true,
      serving_size: true,
      thumbnail_image_url: true,
      users_cooking: {
        select: {
          display_name: true,
          avatar_url: true,
        },
      },
    },

    where: {
      is_published: true,
    },
    orderBy: {
      updated_at: 'desc',
    },
    skip: offset,
    take: limit,
  });

  const publishedRecipesCount = await prisma.recipes.count({ where: { is_published: true } });

  return {
    recipeData,
    totalItems: publishedRecipesCount,
  };
};

export const fetchDetailRecipeFromDB = async (recipeId: string) => {
  const detailRecipe = await prisma.recipes.findFirst({
    where: { id: recipeId },
    select: {
      id: true,
      title: true,
      description: true,
      ingredients: true,
      instructions: true,
      prep_time_minutes: true,
      cooking_time_minutes: true,
      serving_size: true,
      large_image_url: true,
      updated_at: true,
      author_id: true,
      users_cooking: {
        select: {
          display_name: true,
          avatar_url: true,
        },
      },
    },
  });
  if (!detailRecipe) {
    throw new Error('This recipe does not exist');
  }
  return detailRecipe;
};

export const fetchRecipesPerAuthorFromDB = async (userId: string, offset: number, limit: number) => {
  const recipeData = await prisma.recipes.findMany({
    select: {
      id: true,
      title: true,
      prep_time_minutes: true,
      cooking_time_minutes: true,
      serving_size: true,
      thumbnail_image_url: true,
      is_published: true,
    },
    where: {
      author_id: userId,
    },
    orderBy: {
      updated_at: 'desc',
    },
    skip: offset,
    take: limit,
  });

  const allRecipesCount = await prisma.recipes.count({ where: { author_id: userId } });
  const draftRecipesCount = await prisma.recipes.count({ where: { author_id: userId, is_published: false } });

  return {
    recipeData,
    totalItems: allRecipesCount,
    draftItems: draftRecipesCount,
  };
};

export const deleteRecipeFromDB = async (
  recipeId: string,
  userId: string,
  deleteImageCallback: (thummbnailImageUrl: string | null, largeImageUrl: string | null) => Promise<void>
) => {
  return await prisma.$transaction(
    async tx => {
      const deleteRecipe = await tx.recipes.delete({
        where: {
          author_id: userId,
          id: recipeId,
        },
        select: {
          thumbnail_image_url: true,
          large_image_url: true,
        },
      });
      const { thumbnail_image_url, large_image_url } = deleteRecipe;
      await deleteImageCallback(thumbnail_image_url, large_image_url);
    },
    {
      timeout: 60000, // 60 seconds timeout for S3 delete operations
    }
  );
};

export const updateRecipeData = async (recipeId: string, userId: string, updateData: Record<string, any>) => {
  return await prisma.recipes.update({
    where: {
      id: recipeId,
      author_id: userId,
    },
    data: updateData,
  });
};

export const updateRecipeWithImagesTransaction = async (
  recipeId: string,
  userId: string,
  updateData: Record<string, any>,
  imageProcessingCallback: (recipeId: string) => Promise<{ thumbnailUrl: string; largeUrl: string }>
) => {
  return await prisma.$transaction(
    async tx => {
      const updatedRecipe = await tx.recipes.update({
        where: {
          id: recipeId,
          author_id: userId,
        },
        data: updateData,
        select: {
          id: true,
        },
      });

      const { thumbnailUrl, largeUrl } = await imageProcessingCallback(updatedRecipe.id);

      await tx.recipes.update({
        where: { id: updatedRecipe.id },
        data: {
          thumbnail_image_url: thumbnailUrl,
          large_image_url: largeUrl,
        },
      });
    },
    {
      timeout: 60000, // 60 seconds timeout for S3 operations
    }
  );
};
