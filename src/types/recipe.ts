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

type RecipeDataWithoutAuthor = Omit<RecipeDataForHomePage, 'authorName' | 'authorAvatarUrl'>;

export interface RecipeData {
  recipeData: RecipeDataForHomePage[];
  totalItems: number;
  hasMore: boolean;
}

export interface RecipeWithoutAuthorData {
  recipeData: RecipeDataWithoutAuthor[];
  totalItems: number;
  hasMore: boolean;
}

export interface RecipeDetailData {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookingTimeMinutes: number;
  servingSize: number;
  imageUrl: string | null;
  recipeUpdatedAt: Date;
  authorName: string;
  authorAvatarUrl: string | null;
}
