import { RecipeRequestBody } from '@/controllers/recipes';
import { saveRecipeToDatabase } from '@/repositories/recipes';

export class RecipeService {
  async saveRecipe(
    {
      title,
      description,
      ingredients,
      instructions,
      prepTimeMinutes,
      cookingTimeMinutes,
      servingSize,
      imageUrl,
      isPublished,
    }: RecipeRequestBody,
    userId: string
  ) {
    if (
      !title ||
      !description ||
      !ingredients ||
      !instructions ||
      !prepTimeMinutes ||
      !cookingTimeMinutes ||
      !servingSize ||
      !isPublished
    ) {
      throw new Error('All fields are required');
    }

    const recipes = await saveRecipeToDatabase(
      title,
      description,
      ingredients,
      instructions,
      prepTimeMinutes,
      cookingTimeMinutes,
      servingSize,
      imageUrl,
      isPublished,
      userId
    );
    return recipes;
  }
}
