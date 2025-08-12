import { saveRecipeToDatabase, getMostRecentRecipeId } from '@/repositories/recipes';

export class RecipeService {
  saveRecipe = async (
    title: string,
    description: string,
    ingredients: string[],
    instructions: string[],
    prepTimeMinutes: number,
    cookingTimeMinutes: number,
    servingSize: number,
    isPublished: boolean,
    userId: string
  ) => {
    const recipes = await saveRecipeToDatabase(
      title,
      description,
      ingredients,
      instructions,
      prepTimeMinutes,
      cookingTimeMinutes,
      servingSize,
      isPublished,
      userId
    );
    return recipes;
  };

  getRecipeId = async (userId: string) => {
    const mostRecentRecipedId = await getMostRecentRecipeId(userId);
    return mostRecentRecipedId;
  };
}
