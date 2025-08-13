import {
  createRecipeWithImagesTransaction,
  fetchDetailRecipeFromDB,
  fetchRecipesPerAuthorFromDB,
  fetchRecipesUsingOffsetAndLimit,
  saveRecipeWithoutImages,
} from '@/repositories/recipes';
import { RecipeData, RecipeDetailData, RecipeWithoutAuthorData } from '@/types/recipe';

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
    const offset = (page - 1) * limit;
    const { recipeData, totalItems } = await fetchRecipesUsingOffsetAndLimit(offset, limit);
    const hasMore = page * limit <= totalItems;
    const formattedRecipedData = recipeData.map(item => {
      return {
        recipeId: item.id,
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

  fetchDetailRecipe = async (recipeId: string): Promise<RecipeDetailData> => {
    const detailRecipe = await fetchDetailRecipeFromDB(recipeId);
    const formattedDetailRecipe = {
      id: detailRecipe.id,
      title: detailRecipe.title,
      description: detailRecipe.description,
      ingredients: detailRecipe.ingredients,
      instructions: detailRecipe.instructions,
      prepTimeMinutes: detailRecipe.prep_time_minutes,
      cookingTimeMinutes: detailRecipe.cooking_time_minutes,
      servingSize: detailRecipe.serving_size,
      imageUrl: detailRecipe.large_image_url,
      recipeUpdatedAt: detailRecipe.updated_at,
      authorName: detailRecipe.users_cooking.display_name,
      authorAvatarUrl: detailRecipe.users_cooking.avatar_url,
    };
    return formattedDetailRecipe;
  };

  fetchRecipesPerAuthor = async (page: number, limit: number, userId: string): Promise<RecipeWithoutAuthorData> => {
    const offset = (page - 1) * limit;
    const { recipeData, totalItems } = await fetchRecipesPerAuthorFromDB(userId, offset, limit);
    const hasMore = page * limit <= totalItems;
    const formattedRecipedData = recipeData.map(item => {
      return {
        recipeId: item.id,
        title: item.title,
        prepTimeMinutes: item.prep_time_minutes,
        cookingTimeMinutes: item.cooking_time_minutes,
        servingSize: item.serving_size,
        imageUrl: item.thumbnail_image_url,
      };
    });
    return {
      recipeData: formattedRecipedData,
      totalItems,
      hasMore,
    };
  };
}
