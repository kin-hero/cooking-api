/**
 * Schema for GET /recipes/author - Get Author's Recipes endpoint
 */
import { FastifySchema } from 'fastify';
import { paginationQuerySchema, paginatedAuthorResponseDataSchema } from './pagination';

const authorRecipeItemSchema = {
  type: 'object',
  properties: {
    recipeId: {
      type: 'string',
      format: 'uuid',
      description: 'Unique recipe identifier',
    },
    title: {
      type: 'string',
      description: 'Recipe title',
    },
    prepTimeMinutes: {
      type: 'integer',
      minimum: 0,
      description: 'Preparation time in minutes',
    },
    cookingTimeMinutes: {
      type: 'integer',
      minimum: 0,
      description: 'Cooking time in minutes',
    },
    servingSize: {
      type: 'integer',
      minimum: 1,
      description: 'Number of servings',
    },
    imageUrl: {
      type: ['string', 'null'],
      format: 'uri',
      description: 'Recipe thumbnail image URL',
    },
    isPublished: {
      type: ['boolean'],
      description: 'Recipe published status',
    },
  },
  required: ['recipeId', 'title', 'prepTimeMinutes', 'cookingTimeMinutes', 'servingSize', 'imageUrl', 'isPublished'],
  additionalProperties: false,
} as const;

export const getAuthorRecipesSchema: FastifySchema = {
  querystring: paginationQuerySchema,

  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', const: true },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            recipeData: {
              type: 'array',
              items: authorRecipeItemSchema,
              description: 'Array of author recipe items',
            },
            ...paginatedAuthorResponseDataSchema.properties,
          },
          required: ['recipeData', 'totalItems', 'hasMore', 'draftItems'],
          additionalProperties: false,
        },
      },
      required: ['success', 'message', 'data'],
      additionalProperties: false,
      description: 'Successful response with author recipe list',
    },
  },
} as const;
