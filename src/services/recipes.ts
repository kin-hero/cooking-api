import {
  createRecipeWithImagesTransaction,
  deleteRecipeFromDB,
  fetchDetailRecipeFromDB,
  fetchRecipesPerAuthorFromDB,
  fetchRecipesUsingOffsetAndLimit,
  saveRecipeWithoutImages,
  updateRecipeData,
  updateRecipeWithImagesTransaction,
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
    imageProcessingCallback: (recipeId: string) => Promise<{ thumbnailUrl: string; largeUrl: string }>
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

  fetchDetailRecipe = async (recipeId: string, userId: string | undefined): Promise<RecipeDetailData> => {
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
      isOwner: userId ? userId === detailRecipe.author_id : false,
    };
    return formattedDetailRecipe;
  };

  fetchRecipesPerAuthor = async (page: number, limit: number, userId: string): Promise<RecipeWithoutAuthorData> => {
    const offset = (page - 1) * limit;
    const { recipeData, totalItems, draftItems } = await fetchRecipesPerAuthorFromDB(userId, offset, limit);
    const hasMore = page * limit <= totalItems;
    const formattedRecipedData = recipeData.map(item => {
      return {
        recipeId: item.id,
        title: item.title,
        prepTimeMinutes: item.prep_time_minutes,
        cookingTimeMinutes: item.cooking_time_minutes,
        servingSize: item.serving_size,
        imageUrl: item.thumbnail_image_url,
        isPublished: item.is_published,
      };
    });
    return {
      recipeData: formattedRecipedData,
      totalItems,
      draftItems,
      hasMore,
    };
  };
  removeRecipe = async (
    recipeId: string,
    userId: string,
    deleteImageCallback: (thummbnailImageUrl: string | null, largeImageUrl: string | null) => Promise<void>
  ) => {
    await deleteRecipeFromDB(recipeId, userId, deleteImageCallback);
  };

  private mapUpdateFields(updateFields: Record<string, any>): Record<string, any> {
    const updateData: Record<string, any> = {};
    const fieldMapping: Record<string, string> = {
      title: 'title',
      description: 'description',
      ingredients: 'ingredients',
      instructions: 'instructions',
      prepTimeMinutes: 'prep_time_minutes',
      cookingTimeMinutes: 'cooking_time_minutes',
      servingSize: 'serving_size',
      isPublished: 'is_published',
    };

    Object.entries(updateFields).forEach(([frontendFieldName, value]) => {
      const dbFieldName = fieldMapping[frontendFieldName];
      if (dbFieldName) {
        updateData[dbFieldName] = value;
      }
    });

    updateData.updated_at = new Date();
    return updateData;
  }

  updateRecipeWithoutImage = async (recipeId: string, userId: string, updateFields: Record<string, any>) => {
    const updateData = this.mapUpdateFields(updateFields);
    await updateRecipeData(recipeId, userId, updateData);
  };

  updateRecipeWithTransaction = async (
    recipeId: string,
    userId: string,
    updateFields: Record<string, any>,
    imageProcessingCallback: (recipeId: string) => Promise<{ thumbnailUrl: string; largeUrl: string }>
  ) => {
    const updateData = this.mapUpdateFields(updateFields);
    await updateRecipeWithImagesTransaction(recipeId, userId, updateData, imageProcessingCallback);
  };
}
