import { FastifyRequest, FastifyReply } from 'fastify';
import { RecipeService } from '@/services/recipes';
import { AuthenticatedRequest } from '@/middleware/auth';

const recipeService = new RecipeService();

export interface RecipeRequestBody {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookingTimeMinutes: number;
  servingSize: number;
  imageUrl: string | null;
  isPublished: boolean;
}

export const createRecipe = async (request: FastifyRequest<{ Body: RecipeRequestBody }>, reply: FastifyReply) => {
  try {
    const { userId } = (request as AuthenticatedRequest).user;
    await recipeService.saveRecipe(request.body, userId);
    return reply.status(201).send({
      success: true,
      message: 'Recipe has been created successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
    });
  }
};
