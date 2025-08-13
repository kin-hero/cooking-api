import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { authenticateToken, allowEmptyToken } from '@/middleware/auth';
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
  fastify.get(
    '/',
    {
      schema: getAllRecipesSchema,
    },
    async (request, reply) => {
      await getAllRecipes(request as FastifyRequest<{ Querystring: RecipeAllRequest }>, reply);
    }
  );

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

  fastify.get('/:id', { preHandler: allowEmptyToken, schema: getRecipeByIdSchema }, async (request, reply) => {
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
