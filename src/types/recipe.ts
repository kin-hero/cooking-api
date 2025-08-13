interface RecipeDataForHomePage {
  recipeId: string;
  title: string;
  prepTimeMinutes: number;
  cookingTimeMinutes: number;
  servingSize: number;
  imageUrl: string | null;
  authorName: string;
  authorAvatarUrl: string | null;
}

export interface RecipeData {
  recipeData: RecipeDataForHomePage[];
  totalItems: number;
  hasMore: boolean;
}
