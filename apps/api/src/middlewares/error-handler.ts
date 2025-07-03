import type { Context } from "hono";

import { Prisma } from "@prisma/client";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

import * as HttpStatusCodes from "@/errors/http-status-codes";

export function errorHandler(error: Error, c: Context) {
  if (error instanceof ZodError) {
    return c.json({ error: error.message }, HttpStatusCodes.BAD_REQUEST);
  }
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return c.json({ error: error.message }, HttpStatusCodes.BAD_REQUEST);
  }
  else if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }
  return c.json({ error: "Internal server error" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
}
