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
    thumbnailImageUrl: {
      type: ['string', 'null'],
      format: 'uri',
      description: 'Recipe thumbnail image URL',
    },
    largeImageUrl: {
      type: ['string', 'null'],
      format: 'uri',
      description: 'Recipe large image URL',
    },
    isPublished: {
      type: 'boolean',
      description: 'Whether recipe is published',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Recipe creation timestamp',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Recipe last update timestamp',
    },
    author: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'Author unique identifier',
        },
        displayName: {
          type: 'string',
          description: 'Author display name',
        },
        avatarUrl: {
          type: ['string', 'null'],
          format: 'uri',
          description: 'Author avatar image URL',
        },
      },
      required: ['id', 'displayName', 'avatarUrl'],
      additionalProperties: false,
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
    'thumbnailImageUrl',
    'largeImageUrl',
    'isPublished',
    'createdAt',
    'updatedAt',
    'author',
  ],
  additionalProperties: false,
} as const;

export const getRecipeByIdSchema: FastifySchema = {
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
        data: recipeDetailSchema,
      },
      required: ['success', 'message', 'data'],
      additionalProperties: false,
      description: 'Successful response with recipe details',
    },
  },
} as const;
