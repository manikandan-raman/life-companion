import { createRoute } from "@hono/zod-openapi";

import * as HttpStatusCodes from "@/errors/http-status-codes";
import { createRouter } from "@/lib/create-app";
import jsonContent from "@/openapi/helpers/json-content";
import createMessageObjectSchema from "@/openapi/schemas/create-messge-object";

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/health",
      summary: "Health check",
      description: "Check if the API is running",
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          createMessageObjectSchema("Life Companion API"),
          "Life Companion API Index",
        ),
      },
    }),
    (c) => {
      return c.json({
        message: "Life Companion API",
      }, HttpStatusCodes.OK);
    },
  );

export default router;
