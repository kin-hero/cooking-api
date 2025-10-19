/**
 * Schema for GET /recipes - Get All Recipes endpoint
 */
import { FastifySchema } from 'fastify';
import { paginationQuerySchema, paginatedResponseDataSchema } from './pagination';

const recipeItemSchema = {
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
    authorName: {
      type: 'string',
      description: 'Recipe author display name',
    },
    authorAvatarUrl: {
      type: ['string', 'null'],
      format: 'uri',
      description: 'Author avatar image URL',
    },
  },
  required: ['recipeId', 'title', 'prepTimeMinutes', 'cookingTimeMinutes', 'servingSize', 'imageUrl', 'authorName', 'authorAvatarUrl'],
  additionalProperties: false,
} as const;

export const getAllRecipesSchema = {
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
              items: recipeItemSchema,
              description: 'Array of recipe items',
            },
            ...paginatedResponseDataSchema.properties,
          },
          required: ['recipeData', 'totalItems', 'hasMore'],
          additionalProperties: false,
        },
      },
      required: ['success', 'message', 'data'],
      additionalProperties: false,
      description: 'Successful response with recipe list',
    },
  },
} as const satisfies FastifySchema;
