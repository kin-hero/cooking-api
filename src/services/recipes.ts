import { createRecipeWithImagesTransaction, fetchRecipesUsingOffsetAndLimit, saveRecipeWithoutImages } from '@/repositories/recipes';
import { RecipeData } from '@/types/recipe';

export class RecipeService {
  createRecipeWithTransaction = async (
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
    return await createRecipeWithImagesTransaction(recipeData, imageProcessingCallback);
  };

  createRecipeWithoutImage = async (recipeData: {
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
    return await saveRecipeWithoutImages(recipeData);
  };

  fetchAllRecipes = async (page: number, limit: number): Promise<RecipeData> => {
    const offset = (page - 1) * 20;
    const { recipeData, totalItems } = await fetchRecipesUsingOffsetAndLimit(offset, limit);
    const hasMore = page * limit <= totalItems;
    const formattedRecipedData = recipeData.map(item => {
      return {
        recipedId: item.id,
        title: item.title,
        prepTimeMinutes: item.prep_time_minutes,
        cookingTimeMinutes: item.cooking_time_minutes,
        servingSize: item.serving_size,
        imageUrl: item.thumbnail_image_url,
        authorName: item.users_cooking.display_name,
        authorAvatarUrl: item.users_cooking.avatar_url,
      };
    });
    return {
      recipeData: formattedRecipedData,
      totalItems,
      hasMore,
    };
  };
}
