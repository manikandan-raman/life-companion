import { z } from "@hono/zod-openapi";

function createErrorObjectSchema(exampleError: string = "Error") {
  return z.object({
    error: z.string(),
  }).openapi({
    example: {
      error: exampleError,
    },
  });
}

export default createErrorObjectSchema;
