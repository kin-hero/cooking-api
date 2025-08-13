import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import authenticateToken from '@/middleware/auth';
import {
  createRecipe,
  getAllRecipes,
  getDetailRecipe,
  RecipeAllRequest,
  RecipeDetailParams,
  getRecipesPerAuthor,
} from '@/controllers/recipes';
import { getAllRecipesSchema } from '@/schema/recipes/getAll';
import { getRecipeByIdSchema } from '@/schema/recipes/getById';
import { getAuthorRecipesSchema } from '@/schema/recipes/getAuthor';

const recipeRoutes: FastifyPluginAsync = async fastify => {
  // Public routes (no auth required)
  fastify.get(
    '/',
    {
      schema: getAllRecipesSchema,
    },
    async (request, reply) => {
      await getAllRecipes(request as FastifyRequest<{ Querystring: RecipeAllRequest }>, reply);
    }
  );

  // Protected routes (auth required) - Place static routes before dynamic ones
  fastify.get(
    '/author',
    {
      preHandler: authenticateToken,
      schema: getAuthorRecipesSchema,
    },
    async (request, reply) => {
      await getRecipesPerAuthor(request as FastifyRequest<{ Querystring: RecipeAllRequest }>, reply);
    }
  );

  fastify.post(
    '/',
    {
      preHandler: authenticateToken,
    },
    async (request, reply) => {
      await createRecipe(request, reply);
    }
  );

  // Dynamic routes (must come after static routes)
  fastify.get('/:id', { schema: getRecipeByIdSchema }, async (request, reply) => {
    await getDetailRecipe(request as FastifyRequest<{ Params: RecipeDetailParams }>, reply);
  });

  fastify.put('/:id', async (_request, _reply) => {
    return { success: true, message: 'Update recipe - TODO' };
  });

  fastify.delete('/:id', async (_request, _reply) => {
    return { success: true, message: 'Delete recipe - TODO' };
  });
};

export default recipeRoutes;
