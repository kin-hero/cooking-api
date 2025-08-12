import { createRecipeWithImagesTransaction, saveRecipeWithoutImages } from '@/repositories/recipes';

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
}
