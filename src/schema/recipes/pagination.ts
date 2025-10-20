/**
 * Common pagination schemas for consistent pagination patterns
 */
export const paginationQuerySchema = {
  type: 'object',
  properties: {
    page: {
      type: 'integer',
      minimum: 1,
      default: 1,
      description: 'Page number (starts from 1)',
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 20,
      default: 6,
      description: 'Number of items per page (max 20)',
    },
  },
  additionalProperties: false,
} as const;

export const paginatedResponseDataSchema = {
  type: 'object',
  properties: {
    totalItems: {
      type: 'integer',
      minimum: 0,
      description: 'Total number of items available',
    },
    hasMore: {
      type: 'boolean',
      description: 'Whether there are more items available',
    },
  },
  required: ['totalItems', 'hasMore'],
  additionalProperties: true,
} as const;
