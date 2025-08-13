/**
 * Schema for GET /recipes/:id - Get Recipe by ID endpoint
 */
import { FastifySchema } from 'fastify';

const recipeDetailSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'Recipe unique identifier',
    },
    title: {
      type: 'string',
      description: 'Recipe title',
    },
    description: {
      type: 'string',
      description: 'Recipe description',
    },
    ingredients: {
      type: 'array',
      items: { type: 'string' },
      description: 'List of ingredients',
    },
    instructions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Step-by-step cooking instructions',
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
      description: 'Recipe large image URL',
    },
    recipeUpdatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Recipe last update timestamp',
    },
    authorName: {
      type: 'string',
      description: 'Author display name',
    },
    authorAvatarUrl: {
      type: ['string', 'null'],
      format: 'uri',
      description: 'Author avatar image URL',
    },
  },
  required: [
    'id',
    'title',
    'description',
    'ingredients',
    'instructions',
    'prepTimeMinutes',
    'cookingTimeMinutes',
    'servingSize',
    'imageUrl',
    'recipeUpdatedAt',
    'authorName',
    'authorAvatarUrl',
  ],
  additionalProperties: false,
} as const;

export const getRecipeByIdSchema = {
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Recipe unique identifier',
      },
    },
    required: ['id'],
    additionalProperties: false,
  },

  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', const: true },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            recipeDetailData: recipeDetailSchema,
          },
          required: ['recipeDetailData'],
          additionalProperties: false,
        },
      },
      required: ['success', 'message', 'data'],
      additionalProperties: false,
      description: 'Successful response with recipe details',
    },
  },
} as const satisfies FastifySchema;
