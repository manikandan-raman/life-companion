import { z } from "@hono/zod-openapi";
import jsonContent from "../helpers/json-content";

function createMessageObjectSchema(exampleMessage: string = "Hello World") {
  return z.object({
    message: z.string(),
  }).openapi({
    example: {
      message: exampleMessage,
    },
  });
}

export const successMessageSchema = jsonContent(createMessageObjectSchema(), "Success Message");

export default createMessageObjectSchema;
