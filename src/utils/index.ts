// Helper function to extract field values
export const getFieldValue = (
  field: import('@fastify/multipart').Multipart | import('@fastify/multipart').Multipart[] | undefined
): string => {
  if (!field) throw new Error('Missing required field');
  if (Array.isArray(field)) {
    const firstField = field[0];
    if ('value' in firstField) return firstField.value as string;
    throw new Error('Expected field type, got file');
  }
  if ('value' in field) return field.value as string;
  throw new Error('Expected field type, got file');
};
