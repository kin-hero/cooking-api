import { FastifyReply } from 'fastify';

const handleError = (reply: FastifyReply, error: unknown) => {
  // Log the error for debugging purposes (optional but recommended)
  console.error(error);

  // Check if the error is a standard JavaScript Error object
  if (error instanceof Error) {
    // If it is, we can safely use its message property
    return reply.status(400).send({
      success: false,
      error: error.message,
    });
  }

  // If the error is not an instance of Error, or for any other case,
  // send a generic server error to avoid leaking implementation details.
  return reply.status(500).send({
    success: false,
    error: 'An unexpected internal server error occurred.',
  });
};
export default handleError;
