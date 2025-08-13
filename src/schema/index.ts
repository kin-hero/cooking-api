/**
 * Central schema exports for API validation
 *
 * This file provides a single point of import for all API schemas,
 * making it easy to manage and reference schemas across the application.
 */

// Common schemas
export * from './common/response';
export * from './recipes/pagination';

// Recipe schemas
export * from './recipes/create';
export * from './recipes/getAll';
export * from './recipes/getById';

// Authentication schemas
export * from './auth/login';
export * from './auth/register';

// Schema validation utilities
export const validateUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Common schema components for reuse
export const commonSchemaComponents = {
  UUID: {
    type: 'string',
    format: 'uuid',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
  },
  Email: {
    type: 'string',
    format: 'email',
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
  },
  Timestamp: {
    type: 'string',
    format: 'date-time',
  },
  URL: {
    type: 'string',
    format: 'uri',
  },
} as const;
